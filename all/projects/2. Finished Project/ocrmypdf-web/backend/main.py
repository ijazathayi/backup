import os
import shutil
import subprocess
from fastapi import FastAPI, File, UploadFile, BackgroundTasks, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="OCRmyPDF Web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

def cleanup_files(file_paths):
    """Remove files after sending them."""
    for path in file_paths:
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Failed to cleanup {path}: {e}")

# Defined synchronously so FastAPI uses a thread pool, allowing safe COM usage
@app.post("/api/upload")
def upload_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    output_format: str = Form("docx")
):
    if not file.filename.lower().endswith(".pdf"):
        return JSONResponse(status_code=400, content={"message": "Only PDF files are supported."})
    
    input_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    base_name = os.path.splitext(file.filename)[0]
    ocr_pdf_path = os.path.join(PROCESSED_DIR, f"{base_name}_ocr.pdf")
    docx_path = os.path.join(PROCESSED_DIR, f"{base_name}.docx")
    
    try:
        import ocrmypdf
        ocrmypdf.ocr(input_path, ocr_pdf_path, force_ocr=True)
    except Exception as e:
        print(f"Skipping OCR due to missing dependencies: {str(e)}")
        shutil.copy2(input_path, ocr_pdf_path)
        
    files_to_cleanup = [input_path, ocr_pdf_path]
    final_output = ocr_pdf_path

    if output_format == "docx":
        try:
            from pdf2docx import Converter
            cv = Converter(ocr_pdf_path)
            cv.convert(docx_path)
            cv.close()
            
            import zipfile
            temp_path = docx_path + ".tmp"
            with zipfile.ZipFile(docx_path, "r") as zin:
                with zipfile.ZipFile(temp_path, "w") as zout:
                    for item in zin.infolist():
                        data = zin.read(item.filename)
                        if item.filename == "word/document.xml":
                            data_str = data.decode("utf-8")
                            data_str = data_str.replace("<w:start ", "<w:left ")
                            data_str = data_str.replace("</w:start>", "</w:left>")
                            data_str = data_str.replace("<w:end ", "<w:right ")
                            data_str = data_str.replace("</w:end>", "</w:right>")
                            data = data_str.encode("utf-8")
                        zout.writestr(item, data)
            os.remove(docx_path)
            os.rename(temp_path, docx_path)
            
            final_output = docx_path
            files_to_cleanup.append(docx_path)
        except Exception as e:
            return JSONResponse(status_code=500, content={"message": f"PDF to Word conversion failed: {str(e)}"})

    background_tasks.add_task(cleanup_files, files_to_cleanup)
    
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if output_format == "docx" else "application/pdf"
    return FileResponse(
        path=final_output, 
        filename=os.path.basename(final_output),
        media_type=media_type
    )

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
