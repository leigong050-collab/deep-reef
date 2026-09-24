# Generated asset provenance

Tool: built-in OpenAI image generation, not an API-key CLI. Date: 2026-09-24. No remote reference photographs were uploaded; reference sites were viewed for art direction. User approved original concept B, a deep-blue reef with right-hand arch and left satellite rock.

## reef.png
1672×941 RGB production plate edited from approved concept B. Prompt: remove all six fish, seamlessly inpaint water/anemone, preserve exact coral/rock placement, right arch, isolated left island, dark negative space, sand, camera, lighting. No added objects or UI. The tool was asked for 4K, but returned 1672×941; it is documented and distributed at actual resolution, not mislabeled 4K.

## clownfish.png
1536×1024 RGBA. Prompt: one anatomically accurate ocellaris clownfish, right-facing full lateral profile, horizontal spine, relaxed pose, real alpha transparency, fine scales/fin rays, three white bands with black borders, cool reef lighting, no background/text/shadow/scenery.

## chromis.png
1536×1024 RGBA. Prompt: one Chromis viridis, right-facing full lateral profile, horizontal, restrained turquoise iridescence, delicate forked translucent tail, realistic anatomy and neutral/cool aquarium light, true transparent alpha, no scenery, text, halo or shadows.

Alpha was inspected: both fish have transparent pixels and nonzero foreground alpha. The runtime applies alpha testing and subdued tinting for integration with the approved blue-hour plate.

Only soft coral/anemone masks receive displacement. Background rock geometry and framing stay fixed. All fish movement is separate from the image.

## yellow.png / gramma.png / butterfly.png
Three original generated 1536×1024 RGBA lateral-profile sprites: yellow tang, royal gramma and copperband butterflyfish. Each faces right, with realistic anatomy, restrained cool aquarium illumination and transparent background; no visible typography. Generated 2026-09-24. These expand the scene to five species; the chromis asset is also used by the twelve-fish school.
