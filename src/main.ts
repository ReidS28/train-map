import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initDevtools } from './lib/devtools';

const app = mount(App, {
  target: document.getElementById('app')!,
})

initDevtools();
export default app
