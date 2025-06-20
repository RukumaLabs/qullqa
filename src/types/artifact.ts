export interface ArtifactVersion {
  versionId: string;        // UUID for this version
  versionNumber: number;    // Sequential version number
  content: string;
  contentType: string;
  size: number;
  timestamp: number;
  changelog?: string;       // Optional description of changes
  parentVersion?: string;   // Reference to previous version
}

export interface StoredArtifact {
  artifactId: string;       // Primary identifier
  name: string;             // User-friendly name
  type: 'code' | 'document' | 'diagram' | 'html' | 'data';
  currentVersion: string;   // Reference to latest version
  versions: ArtifactVersion[];
  metadata: {
    created: number;
    lastModified: number;
    tags?: string[];
    description?: string;
    language?: string;      // For code artifacts
  };
}

export interface ArtifactCreateInput {
  name: string;
  content: string;
  contentType: string;
  type: StoredArtifact['type'];
  description?: string;
  tags?: string[];
  language?: string;
  changelog?: string;
}

export interface ArtifactUpdateInput {
  artifactId: string;
  content: string;
  contentType?: string;
  changelog?: string;
}

export interface ArtifactListItem {
  artifactId: string;
  name: string;
  type: StoredArtifact['type'];
  currentVersionNumber: number;
  totalVersions: number;
  lastModified: number;
  size: number;
  contentType: string;
  tags?: string[];
}