// Simple AI Chatbot Controller
const chat = async (req, res) => {
    try {
        const { message, userName, userEmail } = req.body;

        console.log('AI Chat request:', { message, userName, userEmail });

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Simple response logic
        let response = '';
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('copywriter') || lowerMessage.includes('harga') || lowerMessage.includes('jasa')) {
            response = 'Layanan Copywriter TRAVELLO - Kami menyediakan berbagai layanan copywriting: Content Writing, SEO Content, Business Content, Digital Marketing, Content Strategy. Semua layanan include research, editing, dan revisi!';
        } else if (lowerMessage.includes('travel') || lowerMessage.includes('wisata') || lowerMessage.includes('destinasi')) {
            response = 'Top Destinasi Wisata Indonesia - Bali, Yogyakarta, Raja Ampat, Labuan Bajo, Lombok. Kami siap membantu perjalanan Anda!';
        } else if (lowerMessage.includes('travello') || lowerMessage.includes('tentang') || lowerMessage.includes('about')) {
            response = 'Tentang TRAVELLO - Platform travel & content terintegrasi dengan 10+ tahun pengalaman, 500+ satisfied clients, dan 24/7 customer support. Kami siap membantu perjalanan dan kebutuhan content Anda!';
        } else {
            response = 'Maaf, kami belum memiliki pelayanan tersebut. TRAVELLO hanya fokus pada Layanan Travel & Wisata serta Jasa Copywriter & Content. Silakan ajukan pertanyaan seputar travel atau copywriting. Kami siap membantu!';
        }

        console.log('AI Response generated successfully');

        res.status(200).json({
            success: true,
            data: {
                response: response,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                response: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi beberapa saat. Jika masalah berlanjut, hubungi support kami!'
            }
        });
    }
};

module.exports = {
    chat
};