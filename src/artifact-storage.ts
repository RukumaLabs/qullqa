import { promises as fs } from 'fs';
import { join } from 'path';
import { storagePath } from './utils/storage-path.js';

export interface ArtifactMetadata {
  id: string;
  workspace: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  currentVersion: number;
  versions: ArtifactVersion[];
}

export interface ArtifactVersion {
  version: number;
  timestamp: number;
  changelog?: string;
  size: number;
}

export class ArtifactStorage {
  private get artifactsDir(): string {
    return storagePath.getArtifactsDir();
  }

  async init(): Promise<void> {
    await storagePath.ensureDirectories();
  }

  private getWorkspacePath(workspace: string): string {
    return join(this.artifactsDir, workspace);
  }

  private getArtifactPath(workspace: string, id: string): string {
    return join(this.artifactsDir, workspace, id);
  }

  private getVersionPath(workspace: string, id: string, version: number): string {
    return join(this.artifactsDir, workspace, id, 'versions', `v${version}`);
  }

  private getLatestPath(workspace: string, id: string): string {
    return join(this.artifactsDir, workspace, id, 'latest');
  }

  private getMetadataPath(workspace: string, id: string): string {
    return join(this.artifactsDir, workspace, id, 'metadata.json');
  }

  async storeArtifact(
    workspace: string,
    id: string,
    html: string,
    description?: string
  ): Promise<{ url: string; version: number }> {
    await this.init();

    const artifactPath = this.getArtifactPath(workspace, id);
    const metadataPath = this.getMetadataPath(workspace, id);
    
    // Check if artifact already exists
    let metadata: ArtifactMetadata;
    try {
      const existingData = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(existingData);
      // If it exists, delegate to update
      return this.updateArtifact(workspace, id, html, 'Initial version via store-artifact');
    } catch {
      // New artifact
      metadata = {
        id,
        workspace,
        description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentVersion: 1,
        versions: []
      };
    }

    // Create directory structure
    await fs.mkdir(artifactPath, { recursive: true });
    await fs.mkdir(join(artifactPath, 'versions'), { recursive: true });

    // Store version 1
    const v1Path = this.getVersionPath(workspace, id, 1);
    await fs.mkdir(v1Path, { recursive: true });
    await fs.writeFile(join(v1Path, 'index.html'), html);

    // Create/update latest symlink
    const latestPath = this.getLatestPath(workspace, id);
    try {
      await fs.unlink(latestPath);
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(latestPath, { recursive: true });
    await fs.writeFile(join(latestPath, 'index.html'), html);

    // Update metadata
    metadata.versions.push({
      version: 1,
      timestamp: Date.now(),
      changelog: 'Initial version',
      size: Buffer.byteLength(html, 'utf8')
    });

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return {
      url: `/a/${workspace}/${id}/`,
      version: 1
    };
  }

  async updateArtifact(
    workspace: string,
    id: string,
    html: string,
    changelog?: string
  ): Promise<{ url: string; version: number }> {
    const metadataPath = this.getMetadataPath(workspace, id);
    
    // Read existing metadata
    let metadata: ArtifactMetadata;
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(data);
    } catch {
      throw new Error(`Artifact ${workspace}/${id} not found`);
    }

    // Increment version
    const newVersion = metadata.currentVersion + 1;
    
    // Store new version
    const versionPath = this.getVersionPath(workspace, id, newVersion);
    await fs.mkdir(versionPath, { recursive: true });
    await fs.writeFile(join(versionPath, 'index.html'), html);

    // Update latest
    const latestPath = this.getLatestPath(workspace, id);
    await fs.writeFile(join(latestPath, 'index.html'), html);

    // Update metadata
    metadata.currentVersion = newVersion;
    metadata.updatedAt = Date.now();
    metadata.versions.push({
      version: newVersion,
      timestamp: Date.now(),
      changelog: changelog || `Version ${newVersion}`,
      size: Buffer.byteLength(html, 'utf8')
    });

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return {
      url: `/a/${workspace}/${id}/`,
      version: newVersion
    };
  }

  async getArtifactUrl(
    workspace: string,
    id: string,
    version?: number
  ): Promise<string> {
    const metadataPath = this.getMetadataPath(workspace, id);
    
    try {
      await fs.access(metadataPath);
    } catch {
      throw new Error(`Artifact ${workspace}/${id} not found`);
    }

    if (version) {
      return `/a/${workspace}/${id}/v${version}/`;
    }
    return `/a/${workspace}/${id}/`;
  }

  async listWorkspaces(): Promise<string[]> {
    await this.init();
    
    try {
      const entries = await fs.readdir(this.artifactsDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch {
      return [];
    }
  }

  async listWorkspaceArtifacts(workspace: string): Promise<ArtifactMetadata[]> {
    const workspacePath = this.getWorkspacePath(workspace);
    
    try {
      const entries = await fs.readdir(workspacePath, { withFileTypes: true });
      const artifacts: ArtifactMetadata[] = [];
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const metadataPath = join(workspacePath, entry.name, 'metadata.json');
            const data = await fs.readFile(metadataPath, 'utf-8');
            artifacts.push(JSON.parse(data));
          } catch {
            // Skip if no metadata
          }
        }
      }
      
      return artifacts.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  async getArtifactMetadata(workspace: string, id: string): Promise<ArtifactMetadata | null> {
    const metadataPath = this.getMetadataPath(workspace, id);
    
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

export const artifactStorage = new ArtifactStorage();