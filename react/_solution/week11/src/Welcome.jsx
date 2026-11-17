// Your first component: a function that returns JSX. It takes "props": here, a name.
// <Welcome name="mflix" /> in App.jsx calls Welcome({ name: 'mflix' }).
export default function Welcome({ name }) {
  return <p className="lead">Welcome to {name}.</p>
}
