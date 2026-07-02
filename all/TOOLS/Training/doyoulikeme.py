import tkinter as tk
import random

def show_popup():
    popup = tk.Toplevel(root)
    popup.title("Popup")
    popup.geometry("250x100")
    tk.Label(popup, text="Thanks for Accepting 😊", font=("Arial", 12)).pack(padx=20, pady=20)

def move_button(event):
    btn_w = no_button.winfo_reqwidth()
    btn_h = no_button.winfo_reqheight()
    x = random.randint(0, 400 - btn_w)
    y = random.randint(50, 400 - btn_h) # 50 so it doesn't cover the question
    no_button.place(x=x, y=y)

root = tk.Tk()
root.title("This is from your lovable Guy😘")
# root.title("instagram: @pythonlearnerr")
root.geometry("400x400")
root.resizable(False, False)

tk.Label(root, text="Do you like me?", font=("Arial", 16)).pack(pady=30)

yes_button = tk.Button(root, text="Yes", command=show_popup, width=10, bg="#4CAF50", fg="white")
yes_button.pack(pady=10)

no_button = tk.Button(root, text="No", width=10, bg="#f44336", fg="white")
no_button.place(x=160, y=200) # start with place so we don't mix pack/place
no_button.bind("<Enter>", move_button)

root.mainloop()