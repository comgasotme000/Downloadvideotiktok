// ==========================================
// PHẦN 1: MÁY CHỦ XỬ LÝ (BACKEND)
// ==========================================
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Đường dẫn xử lý khi người dùng bấm nút "Bắt Đầu Lấy Video"
app.get('/download-tiktok', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.json({ success: false, error: 'Vui lòng điền link video!' });
    }

    // CẤU HÌNH KHỚP CHÍNH XÁC THEO ẢNH MỚI CỦA BẠN
    const options = {
        method: 'GET',
        url: 'https://tiktok-video-downloader-api.p.rapidapi.com/media', // Đã đổi thành /media theo ảnh của bạn
        params: { videoUrl: videoUrl }, // Đổi tên param thành videoUrl theo chuẩn của API này
        headers: {
            'X-RapidAPI-Key': 'd2bf749cd0mshcb70d0663e484e6p1d104djsnfcec42eabd7b',
            'X-RapidAPI-Host': 'tiktok-video-downloader-api.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        
        // Trích xuất link video không logo từ kết quả API trả về
        // API này thường trả về link ở mục response.data.data.play hoặc response.data.videoUrl
        const cleanVideoUrl = response.data.data ? response.data.data.play : (response.data.videoUrl || response.data.url);
        
        if (cleanVideoUrl) {
            res.json({ success: true, videoUrl: cleanVideoUrl });
        } else {
            res.json({ success: false, error: 'Không tìm thấy link video sạch trong kết quả trả về.' });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Lỗi kết nối tới hệ thống API hoặc link video không hợp lệ.' });
    }
});

// Trả về giao diện người dùng khi truy cập vào trang web
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
                .card { max-width: 450px; margin: 0 auto; background: white; padding: 40px 30px; border-radius: 15px; box-shadow: 0px 4px 15px rgba(0,0,0,0.08); }
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
                            alert('Lỗi: ' + data.error);
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

// Khởi động cổng chạy trang web
// Khởi động cổng chạy trang web (Sửa lại để thích nghi với Render)
app.listen(process.env.PORT || PORT, () => {
    console.log('=============== THÀNH CÔNG ===============');
    console.log('Trang web đang chạy thành công!');
    console.log('==========================================');
});