"""Initialize the src package and ensure its sub-packages can be imported as top-level modules.

When the project is executed with ``python -m src.<module>``, Python adds the project
root (the directory *containing* ``src``) to ``sys.path`` instead of the ``src``
folder itself. This means that absolute imports such as
``import career_coaches`` would fail because the interpreter cannot find the
``career_coaches`` package inside the root directory.

To resolve this without rewriting all internal imports, we explicitly add the
``src`` directory to ``sys.path`` during package initialisation.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Path of the current ``src`` directory
_src_path = Path(__file__).resolve().parent

# Ensure ``src`` is at the front of ``sys.path`` so its sub-packages are
# importable with absolute names (e.g., ``career_coaches``).
if str(_src_path) not in sys.path:
    sys.path.insert(0, str(_src_path))

# Clean-up namespace
del Path, _src_path
