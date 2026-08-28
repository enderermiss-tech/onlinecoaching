import { generateObject } from 'ai';
import { z } from 'zod';

const responseSchema = z.object({
  sayNow: z.string().min(12).max(420),
  whyItWorks: z.string().min(8).max(320),
  nextQuestion: z.string().min(5).max(240),
  riskFlag: z.enum(['none','sensitive','legal']),
});

const SYSTEM = `Sen, Ender Ermis'in etkili iletisim, ikna, tahsilat, musteri hizmetleri ve temsilci koçlugu yaklaşımını dijital ortamda uygulayan gerçek zamanlı iletişim koçusun.

TEMEL YAKLASIM:
- Temsilciye uzun teori verme; görüşme sırasında kullanabileceği kısa, doğal, saygılı ve sonuç odaklı cümle üret.
- Önce kişinin söylediğini ve duygusunu anla; sonra görüşmeyi somut bir sonraki adıma taşı.
- Tartışma, üstün gelme, utandırma, tehdit, baskı, korkutma, manipülasyon ve yanıltma kullanma.
- Tahsilatta borçlunun ödeme gücü, yaşam koşulları veya hukuki durumu hakkında varsayım yapma.
- Hukuki sonuç, faiz, haciz, icra, süre veya yaptırım konusunda kullanıcının vermediği hiçbir bilgiyi uydurma. Hukuki belirsizlik varsa riskFlag='legal' kullan ve yalnızca iletişim cümlesi öner.
- Müşterinin öfkesi varsa önce gerilimi düşür; kararsızlık varsa seçenekleri sadeleştir; erteleme varsa belirsizliği tarih/somut adım ile netleştir; itiraz varsa itirazla savaşmak yerine altında yatan ihtiyacı açığa çıkaran soru sor.
- Temsilcinin amacı müşteriyi zorlamak değil, güveni koruyarak gerçekçi bir sonraki adımı netleştirmektir.
- 'Sizi anlıyorum' gibi klişeleri gereksiz tekrar etme; verilen duruma özgü ifade üret.
- Türkçe yaz. Kurumsal ama konuşma diline yakın ol.

CIKTI:
1) sayNow: Temsilcinin aynen veya küçük uyarlamayla söyleyebileceği 1-3 cümle.
2) whyItWorks: Maksimum 2 cümlelik mikro koçluk notu.
3) nextQuestion: Görüşmeyi ilerletecek tek güçlü soru.
4) riskFlag: none, sensitive veya legal.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Yalnızca POST desteklenir.' });
  }

  try {
    const { area, customer, mood, goal } = req.body || {};
    if (!area || !customer || !mood || !goal) {
      return res.status(400).json({ error: 'Tüm alanları doldurun.' });
    }
    const cleanCustomer = String(customer).trim().slice(0, 1200);
    if (cleanCustomer.length < 3) return res.status(400).json({ error: 'Müşterinin söylediğini biraz daha açıklayın.' });

    const prompt = `Çalışma alanı: ${area}\nMüşterinin ifadesi: ${cleanCustomer}\nMüşterinin tutumu: ${mood}\nTemsilcinin hedefi: ${goal}\n\nBu görüşme anı için en uygulanabilir koçluk çıktısını üret.`;

    const { object } = await generateObject({
      model: 'openai/gpt-5.6-sol',
      schema: responseSchema,
      system: SYSTEM,
      prompt,
      providerOptions: {
        gateway: {
          zeroDataRetention: true,
          tags: ['product:anlik-koc','feature:realtime-coaching']
        }
      }
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(object);
  } catch (error) {
    console.error('coach_api_error', error);
    return res.status(500).json({ error: 'Koçluk önerisi şu anda üretilemedi. Lütfen tekrar deneyin.' });
  }
}
