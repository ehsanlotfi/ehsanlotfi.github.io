import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

const MarkdownRenderer = ({ url }) =>
{
    const [markdown, setMarkdown] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() =>
    {
        const fetchMarkdown = async () =>
        {
            try
            {
                const response = await fetch(url);
                const text = await response.text();
                setMarkdown(marked(text));  // Convert Markdown to HTML
                setLoading(false);
            } catch (err)
            {
                setError('Failed to fetch Markdown');
                setLoading(false);
            }
        };

        fetchMarkdown();
    }, [url]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return <div dangerouslySetInnerHTML={{ __html: markdown }} />;
};

export default MarkdownRenderer;