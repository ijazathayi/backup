import os, sys, traceback
try:
    import win32com.client
    import pythoncom
    pythoncom.CoInitialize()
    word = win32com.client.gencache.EnsureDispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    
    abs_ocr_pdf = os.path.abspath("test.pdf")
    abs_docx = os.path.abspath("test.docx")
    
    print("Opening PDF...")
    word.Documents.Open(abs_ocr_pdf, ConfirmConversions=False)
    doc = word.ActiveDocument
    if doc is None:
        print("Failed to open document")
    else:
        print("Saving as DOCX...")
        doc.SaveAs(abs_docx, FileFormat=16)
        doc.Close(0)
        print("Success")
except Exception as e:
    traceback.print_exc()
finally:
    try:
        word.Quit()
    except:
        pass
    pythoncom.CoUninitialize()
