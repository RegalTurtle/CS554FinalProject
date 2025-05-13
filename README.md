This is our CS554 final project. To set up, first download and install Redis and MongoDB. Optionally, install ImageMagick with `sudo apt install imagemagick` or similar (some features, such as grayscaling images, that use IM will not work on Windows machines). Once installed, run `npm i` to install dependancies. 

Before running the website, ensure that you have a correctly set up `.env` file, including the `USE_IM` option. With `USE_IM=true`, the site will use ImageMagick, which you must have on your machine. With `USE_IM=false`, the site will use Sharp for all of the same functionality, but without the need to have ImageMagick installed locally, or for Windows machines.

To run the website in dev mode, run `npm run dev`, or to compile the website for faster load times and deployment, use `npm run build` followed by `npm start`.
