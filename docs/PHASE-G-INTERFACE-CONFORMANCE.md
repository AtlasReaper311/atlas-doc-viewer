# Phase G: Public Interface V2 conformance

## Outcome

Declare the CV document interface through the accepted
`atlas-control-plane/public-interface-surface/v1` manifest and validate it
against a pinned, merged `atlas-infra` authority.

This is a nonvisual governance adoption. It does not change the PDF, deliberate
load gate, indexing, desktop embed, mobile native handoff, download, deployment,
or provider configuration.

## Boundary

The declaration covers `https://cv.atlas-systems.uk/`. The protected PDF is a
document asset and remains outside the human HTML surface manifest.

## Authority and evidence

- authority commit: `e40d5a5cee6001df17918f69700aebb85d3d1cdd`;
- declaration: `.atlas/public-interface.json`;
- validator: `atlas-infra/scripts/validate_public_interface.py`;
- evidence retention: 14 days.

The conformance job is read-only, validates the exact candidate commit, verifies
the pinned authority SHA, and fails closed if the manifest repository identity
does not match the caller.

## Local validation

```bash
python3 ../atlas-infra/scripts/validate_public_interface.py \
  --root ../atlas-infra \
  --manifest .atlas/public-interface.json
```

## Rollback

Revert the Phase G commit. The protected PDF and production route are unchanged
by the conformance declaration.
