# Welcome to The Web, our CS554 fianal project

To set up, follow these instructions:
1. Have Node and npm installed
2. Run `npm i` to install dependancies
3. Check you have a correctly formatted `.env` file. It should have:
    1. `MONGO_URI`: an optional URI for the Mongo database. If ommitted, uses locally hosted. Remove this if you want to use a local database
    2. `USE_IM`: Set to `true` or `false` depending on whether you want to load ImageMagick
        1. If you set `USE_IM=false`, the site will default to using Sharp, and you can skip step 4
    3. `SESSION_SECRET`: Used for tracking the session
4. If using ImageMagick, ensure IM is installed via `sudo apt install imagemagick` or similar using a package manager
    1. ImageMagick features require ImageMagick to be installed
    2. Some ImageMagick features are not available on Windows, such as grayscale
5. If you would like to get a small seed of data, you have to use the route `GET /api/seed/`. Look in the file to see a couple of the provided usernames and passwords
6. To run dev mode on the website, `npm run dev`
    1. To compile, run `npm run build` and `npm run start`

For hosting with Azure, here is the link: [https://cs554finalproj-d3a5f9amh7gvema3.eastus-01.azurewebsites.net](https://theweb-gadffhftcjhabaez.eastus2-01.azurewebsites.net/)
