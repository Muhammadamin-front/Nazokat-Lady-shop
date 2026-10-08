// iPhone .MOV videolarini sayt uchun siqadi (faqat macOS, qo'shimcha dastur kerak emas).
// H.264 + AAC, uzun tomoni 960px, ~1 Mbit/s -> barcha brauzerlarda (Android ham) o'ynaydi.
// Yana birinchi soniyadan poster rasm (JPEG) chiqaradi.
//
// Ishlatish: swift scripts/compress_video.swift <kirish.MOV> <chiqish.mp4> <poster.jpg> [maks_soniya]

import AVFoundation
import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 4 else {
    print("usage: compress_video.swift in.mov out.mp4 poster.jpg [maxSeconds]")
    exit(1)
}
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
let posterURL = URL(fileURLWithPath: args[3])
let maxSeconds = args.count > 4 ? Double(args[4]) ?? 30 : 30

let LONG_SIDE: CGFloat = 960
let VIDEO_BITRATE = 1_000_000
let AUDIO_BITRATE = 64_000

func run() async throws {
    let asset = AVURLAsset(url: input)
    let duration = try await asset.load(.duration)
    guard let vTrack = try await asset.loadTracks(withMediaType: .video).first else { throw NSError(domain: "no video", code: 1) }
    let aTrack = try await asset.loadTracks(withMediaType: .audio).first
    let natural = try await vTrack.load(.naturalSize)
    let transform = try await vTrack.load(.preferredTransform)

    // Burilishni hisobga olgan holda chiqish o'lchami (juft sonlar)
    let scale = min(1, LONG_SIDE / max(natural.width, natural.height))
    let w = Int((natural.width * scale / 2).rounded()) * 2
    let h = Int((natural.height * scale / 2).rounded()) * 2

    let seconds = min(CMTimeGetSeconds(duration), maxSeconds)
    let range = CMTimeRange(start: .zero, duration: CMTime(seconds: seconds, preferredTimescale: 600))
    print("source \(Int(natural.width))x\(Int(natural.height)) \(String(format: "%.1f", CMTimeGetSeconds(duration)))s -> \(w)x\(h) \(String(format: "%.1f", seconds))s")

    try? FileManager.default.removeItem(at: output)
    let reader = try AVAssetReader(asset: asset)
    reader.timeRange = range
    let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
    writer.shouldOptimizeForNetworkUse = true

    let vOut = AVAssetReaderTrackOutput(track: vTrack, outputSettings: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
    ])
    vOut.alwaysCopiesSampleData = false
    reader.add(vOut)
    let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: w,
        AVVideoHeightKey: h,
        AVVideoScalingModeKey: AVVideoScalingModeResizeAspectFill,
        AVVideoCompressionPropertiesKey: [
            AVVideoAverageBitRateKey: VIDEO_BITRATE,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            AVVideoMaxKeyFrameIntervalKey: 60,
        ],
    ])
    vIn.transform = transform
    vIn.expectsMediaDataInRealTime = false
    writer.add(vIn)

    var aOut: AVAssetReaderTrackOutput?
    var aIn: AVAssetWriterInput?
    if let aTrack {
        let o = AVAssetReaderTrackOutput(track: aTrack, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM])
        reader.add(o)
        let i = AVAssetWriterInput(mediaType: .audio, outputSettings: [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVNumberOfChannelsKey: 2,
            AVSampleRateKey: 44100,
            AVEncoderBitRateKey: AUDIO_BITRATE,
        ])
        i.expectsMediaDataInRealTime = false
        writer.add(i)
        aOut = o
        aIn = i
    }

    reader.startReading()
    writer.startWriting()
    writer.startSession(atSourceTime: .zero)

    func pump(_ out: AVAssetReaderTrackOutput, _ inp: AVAssetWriterInput, _ label: String) async {
        await withCheckedContinuation { (done: CheckedContinuation<Void, Never>) in
            inp.requestMediaDataWhenReady(on: DispatchQueue(label: label)) {
                while inp.isReadyForMoreMediaData {
                    if let buf = out.copyNextSampleBuffer() {
                        inp.append(buf)
                    } else {
                        inp.markAsFinished()
                        done.resume()
                        return
                    }
                }
            }
        }
    }

    async let v: Void = pump(vOut, vIn, "video")
    if let aOut, let aIn {
        async let a: Void = pump(aOut, aIn, "audio")
        _ = await (v, a)
    } else {
        _ = await v
    }
    await writer.finishWriting()
    if writer.status != .completed { throw writer.error ?? NSError(domain: "write failed", code: 2) }

    // Poster: 0.5-soniyadagi kadr
    let gen = AVAssetImageGenerator(asset: asset)
    gen.appliesPreferredTrackTransform = true
    gen.maximumSize = CGSize(width: 1080, height: 1080)
    let (cg, _) = try await gen.image(at: CMTime(seconds: min(0.5, seconds / 2), preferredTimescale: 600))
    guard let dest = CGImageDestinationCreateWithURL(posterURL as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else { return }
    CGImageDestinationAddImage(dest, cg, [kCGImageDestinationLossyCompressionQuality: 0.85] as CFDictionary)
    CGImageDestinationFinalize(dest)

    let size = (try? FileManager.default.attributesOfItem(atPath: output.path)[.size] as? Int) ?? 0
    print("wrote \(output.lastPathComponent) \(size / 1024) KB")
}

let sem = DispatchSemaphore(value: 0)
Task {
    do { try await run() } catch { print("error: \(error)"); exit(1) }
    sem.signal()
}
sem.wait()
