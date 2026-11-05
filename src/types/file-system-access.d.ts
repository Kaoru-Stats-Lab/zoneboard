/**
 * Augment incomplete DOM typings for File System Access Directory mode.
 * Keep as a standalone ambient .d.ts (no matching .ts) so it merges globally.
 */

interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite";
}

interface FileSystemHandle {
  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
}

interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemHandle>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  keys(): AsyncIterableIterator<string>;
}

interface Window {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?:
      | FileSystemHandle
      | "desktop"
      | "documents"
      | "downloads"
      | "music"
      | "pictures"
      | "videos";
  }) => Promise<FileSystemDirectoryHandle>;
}

declare function showDirectoryPicker(options?: {
  id?: string;
  mode?: "read" | "readwrite";
  startIn?:
    | FileSystemHandle
    | "desktop"
    | "documents"
    | "downloads"
    | "music"
    | "pictures"
    | "videos";
}): Promise<FileSystemDirectoryHandle>;
