# 360° dish photography — shooting guide

A photograph has no back. To make a real dish spin on the website, we need one
photograph per angle, played back in sequence. That is all a "360 spin" ever is,
on any website that has one.

## What you need

- A phone (any recent one is fine)
- A tripod, or anything that holds the phone completely still
- A **rotating cake stand / lazy susan** — Rs 1,500–2,500
- A plain backdrop: black or white cloth, no pattern
- Good even light — a large window in daytime is better than any lamp

## How to shoot one dish

1. Put the backdrop behind and under the rotating stand.
2. Centre the dish on the stand. **Off-centre is the single most common
   mistake** — it makes the dish wobble instead of spin.
3. Set the phone on the tripod, angled down about 20–30°, framing the dish with
   a little space around it.
4. **Lock focus and exposure** (tap and hold on the dish until AE/AF LOCK shows).
   If exposure drifts between frames the spin will flicker.
5. Take a photo. Rotate the stand one step. Take the next photo. Repeat all the
   way around.
   - **24 photos** = one step every 15° — good
   - **36 photos** = one step every 10° — smoother, recommended for the hero dish
6. Do not move the phone, do not zoom, do not change the light, and do not let
   a shadow (yours included) fall differently between frames.

Shoot the dish freshly plated and steaming. Steam reads beautifully in a spin.

## What to send

For each dish, a folder of images named in the order they were shot:

```
ran-sajji/001.jpg  002.jpg  003.jpg  …  024.jpg
```

Rotate **anticlockwise as seen from above**, so a left-to-right drag on the
website turns the dish the way the viewer expects.

## Dishes we need (in priority order)

| Folder | Dish |
|---|---|
| `full-platter/` | Full Platter — this one is the homepage hero, shoot 36 frames |
| `ran-sajji/` | Ran Sajji |
| `chicken-sulemani-karahi-1kg/` | Chicken Sulemani Karahi |
| `beef-chapli-1kg/` | Beef Chapli Kabab |
| `kabli-beef-pullao/` | Kabli Beef Pullao |

## After the photos arrive

Drop each folder in here, then in `data/turntables.json` set that dish's
`frames` to the number of photos and `ready` to `true`. The website switches
from the placeholder 3D model to the real photographs immediately — no other
change needed.

Keep each image around 1200px on the long edge and under ~200KB (JPEG quality
about 78). Twenty-four frames at that size is roughly 4MB per dish.
