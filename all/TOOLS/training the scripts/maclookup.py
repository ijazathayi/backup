import requests
import uuid
import re

def get_my_mac():
    """Retrieves the MAC address of the current machine."""
    # Formats the hex string into standard MAC format (XX:XX:XX:XX:XX:XX)
    mac = ':'.join(re.findall('..', '%012x' % uuid.getnode()))
    return mac

def lookup_mac_vendor(mac_address):
    """Looks up the manufacturer of a given MAC address using a public API."""
    # We only need the first 6 characters (the OUI) for the lookup
    url = f"https://api.macvendors.com/{mac_address}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        else:
            return "Vendor not found or API limit reached."
    except Exception as e:
        return f"Error: {e}"

# --- Execution ---
if __name__ == "__main__":
    # 1. Get your own MAC
    my_mac = get_my_mac()
    print(f"Your Device MAC Address: {my_mac}")
    
    # 2. Lookup the vendor for your MAC
    print(f"Looking up manufacturer for {my_mac}...")
    vendor = lookup_mac_vendor(my_mac)
    print(f"Manufacturer: {vendor}")
    
    # 3. Custom lookup example
    # Example: A known Apple MAC address
    example_mac = "00:25:00:FF:94:73"
    print(f"\nExample Lookup ({example_mac}):")
    print(f"Manufacturer: {lookup_mac_vendor(example_mac)}")