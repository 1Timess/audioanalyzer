# Plans and Limits

## Plan Resolution Philosophy

Downstream services should never branch directly on raw plan names.

Instead:
- route loads user context
- plan service resolves an `AnalysisProfile`
- pipeline and services read the profile

## Example Entitlements

### Free
- Small upload cap
- No clip previews
- No spatial analysis
- Conservative clustering limits

### Pro
- Larger upload cap
- Clip previews enabled
- Still conservative on advanced enrichment

### Expert
- Up to 1 GB uploads
- Spatial analysis enabled
- Stereo preservation for optional spatial workflows

### Enterprise
- Highest limits
- Debug metadata allowed
- Most permissive analysis profile