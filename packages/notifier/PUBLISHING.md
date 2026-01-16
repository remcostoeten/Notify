# Publishing Guide

## Prerequisites

1. npm account with publish access
2. Git repository set up
3. All changes committed

## Pre-publish Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with new version
- [ ] Run `npm run build` - verify no errors
- [ ] Run `npm run typecheck` - verify types are correct
- [ ] Test the built package locally
- [ ] Update README if needed
- [ ] Commit all changes

## Local Testing

Test the package locally before publishing:

```bash
# Build the package
npm run build

# Create a tarball
npm pack

# In another project, install the tarball
npm install /path/to/remcostoeten-notifier-1.0.0.tgz
```

## Publishing Steps

### 1. Login to npm

```bash
npm login
```

### 2. Version Bump

```bash
# Patch (1.0.0 -> 1.0.1)
npm version patch

# Minor (1.0.0 -> 1.1.0)
npm version minor

# Major (1.0.0 -> 2.0.0)
npm version major
```

This will:
- Update version in package.json
- Create a git tag
- Commit the changes

### 3. Publish

```bash
# Dry run first (see what will be published)
npm publish --dry-run

# Publish to npm
npm publish --access public
```

### 4. Push to GitHub

```bash
git push origin main
git push --tags
```

## Post-publish

1. Verify package on npmjs.com: https://www.npmjs.com/package/@remcostoeten/notifier
2. Test installation: `npm install @remcostoeten/notifier`
3. Create GitHub release with changelog
4. Tweet about it (optional)

## Versioning Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
  - API changes that break existing code
  - Removing features
  - Changing behavior significantly

- **MINOR** (0.x.0): New features, backwards compatible
  - Adding new features
  - Deprecating features (but not removing)
  - Performance improvements

- **PATCH** (0.0.x): Bug fixes, backwards compatible
  - Bug fixes
  - Documentation updates
  - Internal changes

## CI/CD (Future)

Consider setting up GitHub Actions for:
- Automated testing
- Automated publishing
- Version management
- Changelog generation

## Troubleshooting

### "You need to authenticate"
```bash
npm login
# Follow prompts
```

### "Package already exists"
- Check if version is already published
- Bump version number
- Verify package name is correct

### "Access denied"
- Verify you have publish access
- Check package scope (@remcostoeten)
- Ensure `--access public` flag is used

### Build errors
```bash
# Clean and rebuild
rm -rf dist
npm run build
