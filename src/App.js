import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        setMessages([...messages, { type: 'user', text: input }]);
        setInput('');
        setLoading(true);

        console.log('OpenAI API Key:', process.env.REACT_APP_OPENAI_API_KEY);


        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `Convert the following natural language query into Git commands:\n\n"${input}"\n\nOnly provide Git commands in your response, no other text.` }],
                max_tokens: 150,
                temperature: 0.2,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const commands = response.data.choices[0].text.trim().split('\n').filter(command => command);
            setMessages([...messages, { type: 'user', text: input }, { type: 'ai', commands }]);
        } catch (error) {
            console.error('Error fetching data from OpenAI', error);
            setMessages([...messages, { type: 'user', text: input }, { type: 'ai', commands: ['Error fetching commands.'] }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="chat">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.type}>
                        <p>{msg.type === 'user' ? `You: ${msg.text}` : 'AI:'}</p>
                        {msg.type === 'ai' && msg.commands.map((command, cmdIndex) => (
                            <div key={cmdIndex}>
                                <p>{command}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a Git question..."
                />
                <button onClick={sendMessage} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
            </div>
        </div>
    );
};

export default App;
