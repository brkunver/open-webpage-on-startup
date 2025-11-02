// Node.js script to resize single square image with FFmpeg CPU-only in parallel

const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

const INPUT = "input.png"
const SIZES = [16, 32, 48, 96, 128]
const OUTPUT_DIR = "resized"

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args)
    let output = ""
    let errorOutput = ""

    ffmpeg.stdout.on("data", data => (output += data))
    ffmpeg.stderr.on("data", data => (errorOutput += data))

    ffmpeg.on("close", code => {
      if (code === 0) {
        console.log(output)
        resolve()
      } else {
        console.error(`FFmpeg error (code ${code}):\n${errorOutput}`)
        reject(new Error(`Exited with ${code}`))
      }
    })
  })
}

function resizeImage(size) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(OUTPUT_DIR, `output_${size}.png`)
    const args = ["-i", INPUT, "-vf", `scale=${size}:${size}`, outputPath, "-y"]

    runFFmpeg(args)
      .then(() => {
        console.log(`Resized to ${size}x${size} (CPU)`)
        resolve()
      })
      .catch(err => reject(err))
  })
}

function main() {
  ensureDir(OUTPUT_DIR)
  Promise.all(SIZES.map(size => resizeImage(size)))
    .then(() => {
      console.log("Done!")
    })
    .catch(error => {
      console.error(error.message)
    })
}

main()
