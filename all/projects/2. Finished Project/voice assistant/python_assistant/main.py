import sys
from PyQt5.QtWidgets import QApplication
from ui import JarvisUI
from assistant_core import VoiceAssistantCore

def main():
    app = QApplication(sys.argv)
    
    # Initialize UI
    # We pass callbacks so the UI buttons can trigger core logic
    window = JarvisUI(
        start_callback=lambda: core.start_listening(),
        exit_callback=lambda: sys.exit(0),
        command_callback=lambda cmd: core.process_command(cmd)
    )
    
    # Initialize Core Backend (Voice, AI, TTS)
    core = VoiceAssistantCore(window.signals)
    
    # Optional: Greet the user on launch
    core.speak("System initializing. Standing by.")
    
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
