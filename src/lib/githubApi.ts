const GITHUB_OWNER = 'arturfrut'
const GITHUB_REPO = 'artistic-portfolio-hub'
const GITHUB_BRANCH = 'main'

export interface GitHubFile {
  content: string
  sha: string
}

/**
 * Lee un archivo JSON desde GitHub
 */
export async function getFileFromGitHub(
  filePath: string,
  token: string
): Promise<GitHubFile> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()

  // El contenido viene en base64, lo decodificamos
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c =>
    c.charCodeAt(0)
  )
  const content = new TextDecoder('utf-8').decode(bytes)
  return {
    content,
    sha: data.sha // Necesitamos el SHA para hacer updates
  }
}

/**
 * Actualiza un archivo JSON en GitHub
 */
export async function updateFileOnGitHub(
  filePath: string,
  content: string,
  sha: string,
  token: string,
  commitMessage: string
): Promise<void> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`

  // GitHub espera el contenido en base64
const bytes = new TextEncoder().encode(content);
const encodedContent = btoa(String.fromCharCode(...bytes));

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: commitMessage,
      content: encodedContent,
      sha: sha,
      branch: GITHUB_BRANCH
    })
  })

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    )
  }
}
