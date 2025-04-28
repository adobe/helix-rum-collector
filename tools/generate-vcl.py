#!/usr/bin/env python3
"""
Generate the Fastly-VCL code that replicates the JavaScript isOptelPath()
check, but without loops or charCodeAt.  Each of the 21 character
positions gets its own tiny block:

  • extract that single character with a regex
  • replace a-z by the *pre-multiplied* weight·ASCII value
  • std.atoi()   → integer (empty ⇒ 0)

The final sum is compared to 220 578 exactly like in JS.

Run this script and copy the output into your VCL.
Usage:
  python3 generate-vcl.py         # Generate VCL without debug logs
  python3 generate-vcl.py --verbose  # Generate VCL with detailed debug logs
"""

import argparse

weights = [
    1969, -50, 18, 43, 11, -5, 6, 9, 14, 42,
    29, 39, 32, -40, -38, -15, -14, -10, 4, -48, -12
]
target = 220_578
letters = "abcdefghijklmnopqrstuvwxyz"


def pattern_for_position(pos: int) -> tuple[str, str]:
    """
    Build a regex pattern that extracts exactly the character at index = pos,
    but works even when the string is shorter.
    
    Returns a pattern and a replacement pattern for regsub.
    """
    if pos == 0:
        return "^(.).*$", "\\1"
    else:
        return f"^.{{{pos}}}(.).*$", "\\1"


def emit(verbose=False):
    print("# ---- PRELUDE ----------------------------------------------------------")
    print("# normalise the incoming path once")
    print('declare local var.norm STRING;')
    print('set var.norm = std.tolower(regsub(req.url.path, "[^a-zA-Z]", ""));')
    if verbose:
        print('log "Optel Debug - Normalized Path: " + var.norm;')
    print()

    # per-position blocks
    for pos, w in enumerate(weights):
        pat, rep = pattern_for_position(pos)
        print(f"# --- position {pos} (weight = {w}) ----------------------------------")
        print(f"declare local var.c{pos} STRING;")
        print(f"declare local var.v{pos} INTEGER;")
        # extract - use a simpler approach that handles position correctly
        print(f'set var.c{pos} = "";')
        print(f'if (std.strlen(var.norm) > {pos}) {{')
        print(f'    set var.c{pos} = regsub(var.norm, "{pat}", "{rep}");')
        print(f'}}')
        if verbose:
            print(f'log "Optel Debug - Position {pos} - Character: " + var.c{pos};')
        # a-z replacements
        for i, ch in enumerate(letters):
            val = w * (97 + i)
            print(f'set var.c{pos} = regsub(var.c{pos}, "{ch}", "{val}");')
        # atoi (empty ⇒ 0)
        print(f"set var.v{pos} = std.atoi(var.c{pos});")
        if verbose:
            print(f'log "Optel Debug - Position {pos} - Value: " + var.v{pos};')
        print()

    # final sum
    all_vs = " + ".join(f"var.v{i}" for i in range(21))
    print("# --- final check --------------------------------------------------------")
    print("declare local var.sum INTEGER;")
    print("set var.sum = 0;")
    if verbose:
        print('log "Optel Debug - Initial Sum: " + var.sum;')
    # Break down the sum into separate statements
    for i in range(21):
        print(f"set var.sum += var.v{i};")
        if verbose:
            print(f'log "Optel Debug - After adding v{i}: Sum = " + var.sum;')
    print()
    # Log the total sum before calculating remainder
    if verbose:
        print("log \"Optel Debug - Path: \" + var.norm + \", Total Sum: \" + var.sum;")
    # Calculate remainder using the %= operator
    print(f"set var.sum %= {target};")
    if verbose:
        print(f'log "Optel Debug - After modulo {target}: " + var.sum;')
    print(f'if (var.sum == 0) {{')
    print('  set req.http.X-Optel-Match = "true";')
    if verbose:
        print('  log "Optel Debug - MATCH FOUND!";')
    print('} else {')
    print('  set req.http.X-Optel-Match = "false";')
    if verbose:
        print('  log "Optel Debug - NO MATCH";')
    print('}')

    # Add debug logging
    if verbose:
        print("log \"Optel Debug - Final - Path: \" + var.norm + \", Sum Remainder: \" + var.sum + \", Match: \" + req.http.X-Optel-Match;")
    print("# -----------------------------------------------------------------------")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate Fastly VCL code for path matching')
    parser.add_argument('--verbose', '-v', action='store_true', help='Include debug logging in the generated VCL')
    args = parser.parse_args()
    
    emit(verbose=args.verbose)