import ReactDOM from 'react-dom/client';
import { data } from './data';
import Timeline from './Timeline';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Timeline data={data} />
);
