# API Reference

## Filesystem Tools

### `read_file`
Reads a file as UTF-8 text.

**Input**
- `path: string`

**Output**
- `content: string`

### `write_file`
Writes content to a file, creating parent directories if needed.

**Input**
- `path: string`
- `content: string`

**Output**
- `message: string`
- `writtenPath: string`
- `bytesWritten: number`

### `update_file`
Performs search-and-replace updates inside an existing file.

**Input**
- `path: string`
- `blocks: Array<{ search: string; replace: string }>`
- `useRegex?: boolean`
- `replaceAll?: boolean`

### `list_files`
Lists directory contents, optionally recursively.

**Input**
- `path: string`
- `includeNested?: boolean`
- `maxEntries?: number`

**Output**
- `message: string`
- `tree: string`
- `requestedPath: string`
- `resolvedPath: string`
- `itemCount: number`
- `truncated: boolean`

### `delete_file`
Deletes a file.

### `delete_directory`
Deletes a directory.

### `create_directory`
Creates a directory.

### `move_path`
Moves or renames a file or directory.

### `copy_path`
Copies a file or directory.

### `set_filesystem_default`
Sets the session default filesystem path used to resolve relative tool paths.

## Shared Behavior
- Relative paths resolve against the session default path when set.
- Absolute and relative paths are normalized and checked for traversal.
- `FS_BASE_DIRECTORY` can restrict all filesystem operations to a root boundary.
