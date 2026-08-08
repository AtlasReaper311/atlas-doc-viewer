# Provider guard Wave 3 validation

This documentation-only change validates the Atlas Systems default-branch provider guard on `atlas-doc-viewer`.

Expected protected path:

- pull requests required for the default branch;
- required native context `Static document validation`;
- required context `Gardener native auto-merge barrier`;
- deletion blocked;
- non-fast-forward updates blocked;
- zero required approvals;
- no bypass actors.

This file does not change CV or document-viewer source, protected PDF behaviour, workflows, provider settings, automation variables, deployment state, releases, or existing pull requests.
