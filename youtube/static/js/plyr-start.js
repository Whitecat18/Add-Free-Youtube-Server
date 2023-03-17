(function main() {
  'use strict';

  let captionsActive;

  switch(true) {
    case data.settings.subtitles_mode == 2:
      captionsActive = true;
      break;
    case data.settings.subtitles_mode == 1 && data.has_manual_captions:
      captionsActive = true;
      break;
    default:
      captionsActive = false;
  }

  let qualityOptions = [];
  let qualityDefault;
  for (let src of data['uni_sources']) {
    qualityOptions.push(src.quality_string)
  }
  for (let src of data['pair_sources']) {
    qualityOptions.push(src.quality_string)
  }
  if (data['using_pair_sources'])
    qualityDefault = data['pair_sources'][data['pair_idx']].quality_string;
  else if (data['uni_sources'].length != 0)
    qualityDefault = data['uni_sources'][data['uni_idx']].quality_string;
  else
    qualityDefault = 'None';

  // Fix plyr refusing to work with qualities that are strings
  Object.defineProperty(Plyr.prototype, 'quality', {
    set: function(input) {
      const config = this.config.quality;
      const options = this.options.quality;
      let quality;

      if (!options.length) {
        return;
      }

      // removing this line:
      //let quality = [!is.empty(input) && Number(input), this.storage.get('quality'), config.selected, config.default].find(is.number);
      // replacing with:
      quality = input;
      let updateStorage = true;

      if (!options.includes(quality)) {
        // Plyr sets quality to null at startup, resulting in the erroneous
        // calling of this setter function with input = null, and the
        // commented out code below would set the quality to something
        // unrelated at startup. Comment out and just return.
        return;
        /*const value = closest(options, quality);
          this.debug.warn(`Unsupported quality option: ${quality}, using ${value} instead`);
          quality = value; // Don't update storage if quality is not supported
          updateStorage = false;*/
      } // Update config


      config.selected = quality; // Set quality

      this.media.quality = quality; // Save to storage

      if (updateStorage) {
        this.storage.set({
          quality
        });
      }
    }
  });

  const player = new Plyr(document.getElementById('js-video-player'), {
    disableContextMenu: false,
    captions: {
      active: captionsActive,
      language: data.settings.subtitles_language,
    },
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'captions',
      'settings',
      'pip',
      'airplay',
      'fullscreen'
    ],
    iconUrl: "/youtube.com/static/modules/plyr/plyr.svg",
    blankVideo: "/youtube.com/static/modules/plyr/blank.webm",
    debug: false,
    storage: {enabled: false},
    quality: {
      default: qualityDefault,
      options: qualityOptions,
      forced: true,
      onChange: function(quality) {
        if (quality == 'None') {return;}
        if (quality.includes('(integrated)')) {
          for (let i=0; i < data['uni_sources'].length; i++) {
            if (data['uni_sources'][i].quality_string == quality) {
              changeQuality({'type': 'uni', 'index': i});
              return;
            }
          }
        } else {
          for (let i=0; i < data['pair_sources'].length; i++) {
            if (data['pair_sources'][i].quality_string == quality) {
              changeQuality({'type': 'pair', 'index': i});
              return;
            }
          }
        }
      },
    },
    previewThumbnails: {
      enabled: storyboard_url != null,
      src: [storyboard_url],
    },
    settings: ['captions', 'quality', 'speed', 'loop'],
    tooltips: {
      controls: true,
    },
  });
}());
