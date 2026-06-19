const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/download-tiktok', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.json({ success: false, error: 'Vui lòng điền link video!' });
    }

    const options = {
        method: 'GET',
        url: 'https://tiktok-video-downloader-api.p.rapidapi.com/media', 
        params: { videoUrl: videoUrl }, 
        headers: {
            'X-RapidAPI-Key': 'd2bf749cd0mshcb70d0663e484e6p1d104djsnfcec42eabd7b',
            'X-RapidAPI-Host': 'tiktok-video-downloader-api.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        let cleanVideoUrl = '';
        
        // CHIẾN THUẬT BAO SÂN: Quét sạch tất cả các ngóc ngách cấu trúc dữ liệu
        if (response.data) {
            // Trường hợp 1: Nằm trong response.data.data (Cấu trúc gốc của elisbushaj2)
            if (response.data.data) {
                const d = response.data.data;
                cleanVideoUrl = d.play || d.hdplay || d.wmplay || d.video || d.url || d.link;
            }
            // Trường hợp 2: Nằm ngay ở tầng ngoài cùng của response.data
            if (!cleanVideoUrl) {
                const r = response.data;
                cleanVideoUrl = r.videoUrl || r.url || r.nowatermark || r.download_url || r.play || r.link;
            }
        }
        
        if (cleanVideoUrl) {
            res.json({ success: true, videoUrl: cleanVideoUrl });
        } else {
            // Nếu vẫn không thấy, ép trang web hiện thẳng toàn bộ dữ liệu API trả về lên màn hình luôn
            res.json({ 
                success: false, 
                error: 'Không tìm thấy ô chứa link sạch. Dữ liệu thực tế nhận được là: ' + JSON.stringify(response.data) 
            });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Lỗi kết nối tới hệ thống API hoặc link video không hợp lệ.' });
    }
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Trang Tải Video TikTok Miễn Phí</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; background-color: #f0f2f5; padding: 50px; margin: 0; }
                .card { max-width: 550px; margin: 0 auto; background: white; padding: 40px 30px; border-radius: 15px; box-shadow: 0px 4px 15px rgba(0,0,0,0.08); word-break: break-all; }
                h2 { color: #fe2c55; margin-bottom: 5px; }
                p { color: #666; font-size: 14px; margin-bottom: 25px; }
                input { width: 90%; padding: 12px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
                input:focus { border-color: #fe2c55; }
                button { width: 96%; padding: 12px; background-color: #fe2c55; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; }
                button:hover { background-color: #e12246; }
                #result { margin-top: 25px; display: none; padding: 15px; border-radius: 8px; background-color: #e8f5e9; }
                .btn-download { display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #2ae067; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>TikTok Downloader</h2>
                <p>Công cụ tải video TikTok không dính logo dành cho người mới</p>
                
                <input type="text" id="inputUrl" placeholder="Dán đường link video TikTok vào đây..." />
                <button onclick="getLink()">Bắt Đầu Lấy Video</button>

                <div id="result">
                    <span style="color: #2e7d32; font-weight: bold;">🎉 Thành công! Video đã sẵn sàng:</span><br>
                    <a id="linkGoc" class="btn-download" href="#" target="_blank">Bấm vào đây để Tải Xuống</a>
                </div>
            </div>

            <script>
                async function getLink() {
                    const url = document.getElementById('inputUrl').value;
                    if (!url) return alert('Bạn chưa dán link video vào ô nhập liệu!');

                    const btn = document.querySelector('button');
                    btn.innerText = 'Đang xử lý, vui lòng đợi...';
                    btn.disabled = true;

                    try {
                        const response = await fetch('/download-tiktok?url=' + encodeURIComponent(url));
                        const data = await response.json();

                        if (data.success) {
                            document.getElementById('linkGoc').href = data.videoUrl;
                            document.getElementById('result').style.display = 'block';
                        } else {
                            alert('Thông báo từ hệ thống: ' + data.error);
                        }
                    } catch (err) {
                        alert('Không thể kết nối đến server!');
                    } finally {
                        btn.innerText = 'Bắt Đầu Lấy Video';
                        btn.disabled = false;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(process.env.PORT || PORT, () => {
    console.log('Trang web đang chạy thành công!');
});