import argparse
import json
import sys

try:
    import phonenumbers
    from phonenumbers import carrier, geocoder, timezone
except ImportError:
    print("[!] Missing dependency: phonenumbers")
    print("[!] Install it with: pip install phonenumbers")
    sys.exit(1)


NUMBER_TYPES = {
    phonenumbers.PhoneNumberType.FIXED_LINE: "Fixed line",
    phonenumbers.PhoneNumberType.MOBILE: "Mobile",
    phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "Fixed line or mobile",
    phonenumbers.PhoneNumberType.TOLL_FREE: "Toll free",
    phonenumbers.PhoneNumberType.PREMIUM_RATE: "Premium rate",
    phonenumbers.PhoneNumberType.SHARED_COST: "Shared cost",
    phonenumbers.PhoneNumberType.VOIP: "VoIP",
    phonenumbers.PhoneNumberType.PERSONAL_NUMBER: "Personal number",
    phonenumbers.PhoneNumberType.PAGER: "Pager",
    phonenumbers.PhoneNumberType.UAN: "Universal access number",
    phonenumbers.PhoneNumberType.VOICEMAIL: "Voicemail",
    phonenumbers.PhoneNumberType.UNKNOWN: "Unknown",
}


def parse_phone_number(raw_number, default_region=None, language="en"):
    """
    Returns safe phone-number metadata from public numbering-plan data.
    This does not identify the owner of a number or access private records.
    """
    number = phonenumbers.parse(raw_number, default_region)
    valid = phonenumbers.is_valid_number(number)
    possible = phonenumbers.is_possible_number(number)
    region_code = phonenumbers.region_code_for_number(number)
    number_type = phonenumbers.number_type(number)

    return {
        "input": raw_number,
        "valid": valid,
        "possible": possible,
        "country_code": number.country_code,
        "region_code": region_code,
        "location": geocoder.description_for_number(number, language) or "Unknown",
        "carrier": carrier.name_for_number(number, language) or "Unknown",
        "number_type": NUMBER_TYPES.get(number_type, "Unknown"),
        "timezones": list(timezone.time_zones_for_number(number)),
        "formats": {
            "e164": phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164),
            "international": phonenumbers.format_number(
                number, phonenumbers.PhoneNumberFormat.INTERNATIONAL
            ),
            "national": phonenumbers.format_number(
                number, phonenumbers.PhoneNumberFormat.NATIONAL
            ),
            "rfc3966": phonenumbers.format_number(
                number, phonenumbers.PhoneNumberFormat.RFC3966
            ),
        },
    }


def print_report(result):
    print("\nPhone Number Information")
    print("-" * 28)
    print(f"Input:         {result['input']}")
    print(f"Valid:         {result['valid']}")
    print(f"Possible:      {result['possible']}")
    print(f"Country code:  +{result['country_code']}")
    print(f"Region:        {result['region_code'] or 'Unknown'}")
    print(f"Location:      {result['location']}")
    print(f"Carrier:       {result['carrier']}")
    print(f"Type:          {result['number_type']}")
    print(f"Time zone(s):  {', '.join(result['timezones']) or 'Unknown'}")
    print("\nFormats")
    print("-" * 28)
    for name, value in result["formats"].items():
        print(f"{name.upper():<14}{value}")


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Safe phone number metadata checker. Shows validity, region, carrier, "
            "timezone, type, and standard formats."
        )
    )
    parser.add_argument("number", help="Phone number to check, preferably with country code.")
    parser.add_argument(
        "-r",
        "--region",
        default=None,
        help="Default country/region for local numbers, such as IN, US, GB.",
    )
    parser.add_argument(
        "-l",
        "--language",
        default="en",
        help="Language for carrier/location names. Default: en.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print machine-readable JSON instead of a text report.",
    )

    args = parser.parse_args()

    try:
        result = parse_phone_number(args.number, args.region, args.language)
    except phonenumbers.NumberParseException as error:
        print(f"[!] Could not parse number: {error}")
        sys.exit(2)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print_report(result)


if __name__ == "__main__":
    main()
