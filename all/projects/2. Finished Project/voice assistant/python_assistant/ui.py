import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QGridLayout, QTextEdit)
from PyQt5.QtCore import Qt, QTimer, QTime, QDate, pyqtSignal, QObject
from PyQt5.QtGui import QFont, QColor, QPalette

class Signals(QObject):
    add_log = pyqtSignal(str, str)
    update_status = pyqtSignal(str)

class JarvisUI(QMainWindow):
    def __init__(self, start_callback=None, exit_callback=None, command_callback=None):
        super().__init__()
        
        self.start_callback = start_callback
        self.exit_callback = exit_callback
        self.command_callback = command_callback
        
        self.signals = Signals()
        self.signals.add_log.connect(self._append_log)
        self.signals.update_status.connect(self._update_status_label)

        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('Voice Assistant')
        self.resize(1200, 800)
        
        # Borderless, dark background window
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)
        self.setAttribute(Qt.WA_TranslucentBackground)
        
        # Main Layout
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.central_widget.setObjectName("CentralWidget")
        
        # Apply CSS-like stylesheet
        self.setStyleSheet("""
            #CentralWidget {
                background-color: #030712;
                border: 2px solid #06b6d4;
                border-radius: 10px;
            }
            QLabel {
                color: #22d3ee;
                font-family: 'Consolas', 'Courier New', monospace;
                font-weight: bold;
            }
            .ScifiPanel {
                background-color: rgba(10, 25, 47, 0.4);
                border: 1px solid #0891b2;
                padding: 10px;
            }
            QPushButton {
                background-color: rgba(30, 64, 175, 0.3);
                color: #60a5fa;
                border: 1px solid #3b82f6;
                border-radius: 4px;
                padding: 15px;
                font-family: 'Consolas', monospace;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            QPushButton:hover {
                background-color: rgba(37, 99, 235, 0.5);
                color: #fff;
                border-color: #60a5fa;
            }
            QTextEdit {
                background-color: rgba(0, 0, 0, 0.6);
                color: #38bdf8;
                border: 1px solid #0284c7;
                font-family: 'Consolas', monospace;
                font-size: 14px;
                padding: 10px;
            }
        """)
        
        main_layout = QVBoxLayout(self.central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)
        
        # --- TOP ROW ---
        top_layout = QHBoxLayout()
        
        self.date_label = QLabel()
        self.date_label.setProperty("class", "ScifiPanel")
        self.date_label.setAlignment(Qt.AlignCenter)
        self.date_label.setMinimumSize(250, 60)
        
        center_top = QHBoxLayout()
        self.btn_start = QPushButton("START")
        self.btn_start.setFixedSize(150, 50)
        if self.start_callback:
            self.btn_start.clicked.connect(self.start_callback)
            
        self.btn_exit = QPushButton("EXIT")
        self.btn_exit.setFixedSize(150, 50)
        if self.exit_callback:
            self.btn_exit.clicked.connect(self.exit_callback)
        else:
            self.btn_exit.clicked.connect(self.close)
            
        center_top.addWidget(self.btn_start)
        center_top.addWidget(self.btn_exit)
        
        self.time_label = QLabel()
        self.time_label.setProperty("class", "ScifiPanel")
        self.time_label.setAlignment(Qt.AlignCenter)
        self.time_label.setMinimumSize(250, 60)
        
        top_layout.addWidget(self.date_label)
        top_layout.addStretch()
        top_layout.addLayout(center_top)
        top_layout.addStretch()
        top_layout.addWidget(self.time_label)
        
        # --- MIDDLE ROW ---
        mid_layout = QHBoxLayout()
        
        # Left Buttons
        left_grid = QGridLayout()
        left_btns = [("Youtube", "open youtube"), ("History", ""), 
                     ("Chrome", "open chrome"), ("Vs Code", "open code")]
        for i, (name, cmd) in enumerate(left_btns):
            btn = QPushButton(name)
            btn.setFixedSize(150, 60)
            if cmd and self.command_callback:
                btn.clicked.connect(lambda checked, c=cmd: self.command_callback(c))
            left_grid.addWidget(btn, i//2, i%2)
            
        # Center Console (Logs)
        self.log_console = QTextEdit()
        self.log_console.setReadOnly(True)
        self.log_console.setMinimumHeight(300)
        
        # Right Buttons
        right_grid = QGridLayout()
        right_btns = [("Ms Powerpoint", "open powerpoint"), ("Ms Word", "open word"), 
                      ("Postman", "open postman"), ("Steam", "open steam")]
        for i, (name, cmd) in enumerate(right_btns):
            btn = QPushButton(name)
            btn.setFixedSize(150, 60)
            if cmd and self.command_callback:
                btn.clicked.connect(lambda checked, c=cmd: self.command_callback(c))
            right_grid.addWidget(btn, i//2, i%2)
            
        mid_layout.addLayout(left_grid)
        mid_layout.addWidget(self.log_console, stretch=1)
        mid_layout.addLayout(right_grid)
        
        # --- BOTTOM ROW ---
        bot_layout = QHBoxLayout()
        self.status_label = QLabel("SYSTEM: ONLINE | LISTENING: FALSE")
        self.status_label.setProperty("class", "ScifiPanel")
        self.status_label.setAlignment(Qt.AlignCenter)
        bot_layout.addWidget(self.status_label)
        
        # Assemble Main Layout
        main_layout.addLayout(top_layout)
        main_layout.addLayout(mid_layout)
        main_layout.addLayout(bot_layout)
        
        # Setup Clocks
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_time)
        self.timer.start(1000)
        self.update_time()
        
        self.center_on_screen()

    def center_on_screen(self):
        qr = self.frameGeometry()
        cp = QApplication.desktop().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def update_time(self):
        current_time = QTime.currentTime().toString("hh:mm:ss")
        current_date = QDate.currentDate().toString("ddd MMM dd yyyy")
        self.time_label.setText(f"TIME : {current_time}")
        self.date_label.setText(f"DATE : {current_date}")
        
    def _append_log(self, text, level):
        # Format HTML log based on level
        color = "#22d3ee" # Info Cyan
        if level == "USER": color = "#facc15" # Yellow
        elif level == "AI": color = "#34d399" # Green
        elif level == "ERROR": color = "#f87171" # Red
        elif level == "SUCCESS": color = "#60a5fa" # Blue
        
        self.log_console.append(f"<span style='color: {color};'>[{level}] {text}</span>")
        
        # Auto scroll to bottom
        scrollbar = self.log_console.verticalScrollBar()
        scrollbar.setValue(scrollbar.maximum())

    def _update_status_label(self, text):
        self.status_label.setText(text)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = JarvisUI()
    ex.show()
    sys.exit(app.exec_())
