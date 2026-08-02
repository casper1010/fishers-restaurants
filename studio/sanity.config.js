import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from '../sanity-schema/schema'

// If you run `npx sanity init` and choose (or create) a different project,
// update projectId below (and in sanity.cli.js, and in
// ../assets/sanity-menu.js) to match.
export default defineConfig({
  name: 'default',
  title: 'Fishers Menu',

  projectId: '4ut45eec',
  dataset: 'fishers_menu',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
