const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;



        if (!response.ok) {
            const errorData = await response.text();

            console.error("OpenRouter Error:", errorData);

            return res.status(response.status).json({
                error: errorData
            });
        }

        // Header untuk streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done)
                 break;

            buffer += decoder.decode(value, {
                 stream: true
                 });

            const lines = buffer.split('\n');

            // simpan bagian terakhir karena mungkin belum lengkap
            buffer = lines.pop();

            for (const line of lines) {

                const trimmedLine = line.trim();

                if (!trimmedLine)
                     continue;

                if (!trimmedLine.startsWith('data: ')) {
                    continue;
                }

                const data = trimmedLine.slice(5).trim();

                if (data === '[DONE]') {
                    continue;
                }

                try {

                    const json = JSON.parse(data);

                    const content =
                         json.choices[0].delta?.content;

                    if (content) {
                        res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                } catch (err) {
                    console.error(
                        "Gagal parsing streaming data:",
                        err
                    );
                }
            }
        }
    
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error("Server Error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Terjadi kesalahan pada server"
            });
        } else {
            res.write(
                `data: ${JSON.stringify(
                      "Terjadi kesalahan pada server"
                     )}\n\n`
            );
            res.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});