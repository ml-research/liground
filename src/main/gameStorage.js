import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const appDataPath = app.getPath('userData')
const savedGamesPath = path.join(appDataPath, 'savedGames.json')

/**
 * Load all saved game file paths
 */
export function loadSavedGamePaths () {
  try {
    if (fs.existsSync(savedGamesPath)) {
      const data = fs.readFileSync(savedGamesPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading saved game paths:', error)
  }
  return { games: [] }
}
/**
 * Save a game file path to the registry
 */
export function addGamePath (filePath) {
  try {
    const data = loadSavedGamePaths()
    // Check if path already exists
    if (!data.games.includes(filePath)) {
      data.games.push(filePath)
      fs.writeFileSync(savedGamesPath, JSON.stringify(data, null, 2), 'utf8')
    }
    return true
  } catch (error) {
    console.error('Error adding game path:', error)
    return false
  }
}
/**
 * Remove a game file path from the registry
 */
export function removeGamePath (filePath) {
  try {
    const data = loadSavedGamePaths()
    data.games = data.games.filter(p => p !== filePath)
    fs.writeFileSync(savedGamesPath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error removing game path:', error)
    return false
  }
}
/**
 * Get all saved game file paths
 */
export function getAllSavedGamePaths () {
  const data = loadSavedGamePaths()
  const existingPaths = []
  for (const filePath of data.games) {
    try {
      if (fs.existsSync(filePath)) {
        existingPaths.push(filePath)
      } else {
        // File no longer exists, remove it from the list
        removeGamePath(filePath)
      }
    } catch (error) {
      console.error(`Error checking game file ${filePath}:`, error)
    }
  }
  return existingPaths
}
