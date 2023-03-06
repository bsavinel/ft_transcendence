import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
		return (
			<div className='app'>
                <h1>Au boulot!</h1>
			</div>
		);
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
