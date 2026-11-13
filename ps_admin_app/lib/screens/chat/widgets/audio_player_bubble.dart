import 'dart:convert';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class AudioPlayerBubble extends StatefulWidget {
  final String mediaUrl;
  final double? durationSeconds;
  final bool isAdmin;

  const AudioPlayerBubble({
    super.key,
    required this.mediaUrl,
    this.durationSeconds,
    required this.isAdmin,
  });

  @override
  State<AudioPlayerBubble> createState() => _AudioPlayerBubbleState();
}

class _AudioPlayerBubbleState extends State<AudioPlayerBubble> {
  late final AudioPlayer _player;
  bool _isPlaying = false;
  bool _isLoading = false;
  Duration _position = Duration.zero;
  Duration _totalDuration = Duration.zero;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();

    if (widget.durationSeconds != null && widget.durationSeconds! > 0) {
      _totalDuration = Duration(milliseconds: (widget.durationSeconds! * 1000).round());
    }

    _player.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
          if (state == PlayerState.completed) {
            _position = Duration.zero;
          }
        });
      }
    });

    _player.onPositionChanged.listen((pos) {
      if (mounted) {
        setState(() => _position = pos);
      }
    });

    _player.onDurationChanged.listen((dur) {
      if (mounted && dur.inMilliseconds > 0) {
        setState(() => _totalDuration = dur);
      }
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlayPause() async {
    if (_isPlaying) {
      await _player.pause();
      return;
    }

    setState(() => _isLoading = true);
    try {
      if (widget.mediaUrl.startsWith('data:audio')) {
        final base64Part = widget.mediaUrl.split(',').last;
        final bytes = base64Decode(base64Part);
        await _player.play(BytesSource(bytes));
      } else if (widget.mediaUrl.isNotEmpty) {
        await _player.play(UrlSource(widget.mediaUrl));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not play audio: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = widget.isAdmin ? Colors.black : AppTheme.cyan;
    final secondaryColor = widget.isAdmin ? Colors.black54 : AppTheme.textMuted;
    final displayDuration = _totalDuration.inMilliseconds > 0
        ? _totalDuration
        : Duration(milliseconds: ((widget.durationSeconds ?? 2.0) * 1000).round());

    return Container(
      width: 220,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: widget.isAdmin ? Colors.white.withOpacity(0.25) : Colors.black26,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Play / Pause / Loading button
          InkWell(
            onTap: _isLoading ? null : _togglePlayPause,
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: widget.isAdmin ? Colors.black : AppTheme.cyan,
                shape: BoxShape.circle,
              ),
              child: _isLoading
                  ? Padding(
                      padding: const EdgeInsets.all(9),
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: widget.isAdmin ? Colors.white : Colors.black,
                      ),
                    )
                  : Icon(
                      _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                      color: widget.isAdmin ? Colors.white : Colors.black,
                      size: 24,
                    ),
            ),
          ),
          const SizedBox(width: 10),

          // Waveform / Progress Slider & Time
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 5),
                    trackHeight: 3,
                    activeTrackColor: primaryColor,
                    inactiveTrackColor: secondaryColor.withOpacity(0.3),
                    thumbColor: primaryColor,
                    overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
                  ),
                  child: Slider(
                    value: _position.inMilliseconds
                        .clamp(0, displayDuration.inMilliseconds)
                        .toDouble(),
                    max: displayDuration.inMilliseconds.toDouble() > 0
                        ? displayDuration.inMilliseconds.toDouble()
                        : 1.0,
                    onChanged: (val) {
                      _player.seek(Duration(milliseconds: val.round()));
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatDuration(_position),
                        style: TextStyle(color: secondaryColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _formatDuration(displayDuration),
                        style: TextStyle(color: secondaryColor, fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
