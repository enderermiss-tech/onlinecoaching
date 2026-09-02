import { generateObject } from 'ai';
import { z } from 'zod';

const responseSchema = z.object({
  sayNow: z.string().min(8).max(480),
  whyItWorks: z.string().min(8).max(360),
  nextQuestion: z.string().min(5).max(260),
  riskFlag: z.enum(['none', 'sensitive', 'legal']),
});

const SYSTEM = `Sen Carpediem Coaching Solutions'ın gerçek zamanlı temsilci koçusun. Tahsilat, müşteri hizmetleri, satış sonrası hizmetler ve satış görüşmelerinde temsilciye kısa, doğal, etik ve uygulanabilir Türkçe öneriler ver.

HER YANITTA DÖRT GİRDİNİN TAMAMINI BİRLİKTE DEĞERLENDİR: çalışma alanı, müşterinin tam cümlesi, müşterinin tutumu ve görüşme hedefi. Sadece tutuma göre genel bir şablon verme. Müşterinin söylediği ifadeyi anlam olarak yansıt ve görüşme hedefini cevapta görünür hale getir.

Önce müşterinin duygusunu ve ihtiyacını anlamlandır, sonra görüşmeyi somut bir sonraki adıma taşı. Tehdit, baskı, utandırma, yanıltma, manipülasyon veya hukuki sonuç uydurma kullanma. Kullanıcının vermediği faiz, icra, haciz, yaptırım, garanti, teslim süresi veya şirket politikası uydurma. Cevap, temsilcinin aynen söyleyebileceği kadar doğal olmalı.

TAHSİLATTA özellikle şu ayrımı yap: müşteri şikâyet edeceğini söylüyorsa bunu tartışma konusu yapma; şikâyet hakkı veya hukuki sonuç hakkında yorum yapma. Tehdide karşı tehdit üretme. Görüşme hedefi ödeme sözü almaksa, önce gerilimi düşür, sonra gerçekçi ödeme tarihi veya ödeme kapasitesini açığa çıkaran tek bir soru sor.`;

function includesAny(text, words) {
  return words.some(w => text.includes(w));
}

function fallbackCoach({ area, customer, mood, goal }) {
  const text = String(customer || '').toLocaleLowerCase('tr-TR');
  const legal = includesAny(text, ['avukat', 'icra', 'haciz', 'mahkeme', 'dava', 'yasal', 'hukuk']);
  const hardship = includesAny(text, ['param yok', 'ödeyemem', 'ödeyemiyorum', 'işsiz', 'maaş', 'gelirim yok', 'maddi', 'zor durum']);
  const delay = includesAny(text, ['sonra', 'yarın', 'haftaya', 'ayın', 'bekleyin', 'daha sonra']);
  const complaint = includesAny(text, ['şikayet', 'şikâyet', 'memnun değilim', 'bozuk', 'gelmedi', 'gecikti', 'iptal', 'iade']);
  const complaintThreat = includesAny(text, ['sizi şikayet', 'sizi şikâyet', 'şikayet ederim', 'şikâyet ederim', 'hiçbir işlem yapamazsınız', 'hiç bir işlem yapamazsınız', 'bir şey yapamazsınız', 'hiçbir şey yapamazsınız']);
  const price = includesAny(text, ['pahalı', 'fiyat', 'indirim', 'bütçe']);

  let sayNow = '';
  let whyItWorks = '';
  let nextQuestion = '';

  if (area === 'Tahsilat') {
    if (complaintThreat) {
      if (goal === 'Ödeme sözü almak') {
        sayNow = 'Şikâyet konusunu tartışmaya çevirmeden ilerleyelim. Ben şu an sizi zorlamak değil, ödeme açısından gerçekçi bir sonraki adımı netleştirmek istiyorum. Bugün için mümkün değilse, sizin gerçekten söz verebileceğiniz tarihi belirleyelim.';
        whyItWorks = 'Müşterinin meydan okuyan ifadesine karşı güç mücadelesine girmez; görüşmeyi hedef olan ödeme taahhüdüne geri taşır. Aynı zamanda hukuki sonuç veya tehdit üretmeden kontrolü somut bir adıma çevirir.';
        nextQuestion = 'Ödeme konusunda gerçekten yerine getirebileceğiniz en yakın tarih hangisi?';
      } else {
        sayNow = 'Bu konuyu tartışmaya çevirmeden ilerleyelim. Benim amacım sizi zorlamak değil, bugün hangi noktayı netleştirebileceğimizi belirlemek.';
        whyItWorks = 'Şikâyet tehdidine savunmayla karşılık vermeden gerilimi düşürür ve görüşmenin amacına geri döner.';
        nextQuestion = 'Bu görüşmede bugün netleştirebileceğimiz en gerçekçi adım sizce nedir?';
      }
    } else if (mood === 'Öfkeli') {
      sayNow = 'Sizi zorlayan kısmı netleştirelim. Şu an tartışmak yerine, sizin için gerçekçi olan çözümü birlikte belirlemek istiyorum.';
      whyItWorks = 'Öfkeye karşı savunmaya geçmek yerine kontrol duygusunu müşteriye geri verir ve görüşmeyi çözüme taşır.';
      nextQuestion = 'Bugün bu konuyu ilerletmemizi sağlayacak en gerçekçi adım sizin için ne olur?';
    } else if (hardship) {
      sayNow = 'Şu anda ödeme yapmanın sizin için zor olduğunu duyuyorum. Gerçekçi olmayan bir söz almak yerine, mümkün olan zamanı ve seçeneği netleştirelim.';
      whyItWorks = 'Baskıyı azaltır, müşterinin savunmasını düşürür ve uygulanabilir bir taahhüt için alan açar.';
      nextQuestion = 'Ödeme açısından sizin için daha gerçekçi olabilecek ilk tarih hangisi?';
    } else if (delay || mood === 'Erteliyor') {
      sayNow = 'Bunu belirsiz bırakmayalım. Sizin için uygun olan zamanı netleştirirsek tekrar tekrar aynı konuyu konuşmak zorunda kalmayız.';
      whyItWorks = 'Ertelemeyi çatışmaya dönüştürmeden somut tarih veya adıma çevirir.';
      nextQuestion = 'Hangi gün tekrar konuşmamız sizin için gerçekten uygun olur?';
    } else {
      sayNow = 'Konuyu sizin açınızdan da netleştirelim; bugün ulaşabileceğimiz gerçekçi sonucu birlikte belirleyelim.';
      whyItWorks = 'Müşteriyi sıkıştırmak yerine ortak çözüm çerçevesi kurar.';
      nextQuestion = goal === 'Ödeme sözü almak' ? 'Ödeme konusunda bugün verebileceğiniz en gerçekçi taahhüt nedir?' : 'Bu görüşmenin sonunda hangi noktayı netleştirmiş olursak sizin için de anlamlı olur?';
    }
  } else if (area === 'Müşteri Hizmetleri' || area === 'Satış Sonrası Hizmetler') {
    if (mood === 'Öfkeli' || complaint) {
      sayNow = 'Yaşadığınız sorunun sizi neden rahatsız ettiğini net anladığımdan emin olmak istiyorum. Önce en kritik noktayı belirleyelim, ardından çözebileceğimiz kısmı hemen ele alalım.';
      whyItWorks = 'Müşterinin duyulma ihtiyacını karşılar ve savunma yerine çözüm beklentisi oluşturur.';
      nextQuestion = 'Sizin için bu durumu gerçekten düzeltecek en önemli sonuç nedir?';
    } else if (mood === 'Bilgi istiyor') {
      sayNow = 'Size en doğru bilgiyi verebilmem için ihtiyacınızı bir cümlede netleştireyim; ardından yalnızca ilgili seçeneği paylaşayım.';
      whyItWorks = 'Bilgi kalabalığını azaltır ve müşterinin ihtiyacına odaklanır.';
      nextQuestion = 'Şu anda öğrenmek istediğiniz en kritik bilgi hangisi?';
    } else {
      sayNow = 'Önce beklentinizi netleştirelim; sonra size en uygun çözüm yolunu birlikte seçelim.';
      whyItWorks = 'Varsayım yapmak yerine müşterinin gerçek beklentisini açığa çıkarır.';
      nextQuestion = 'Bu görüşme sonunda sizin için ideal çözüm nasıl görünürdü?';
    }
  } else {
    if (price || mood === 'İtiraz ediyor') {
      sayNow = 'Fiyatın sizin için önemli bir karar noktası olduğunu görüyorum. Önce hangi değeri beklediğinizi netleştirelim; sonra teklifin sizin için anlamlı olup olmadığına birlikte bakalım.';
      whyItWorks = 'Fiyat itirazıyla mücadele etmek yerine karar kriterini ortaya çıkarır.';
      nextQuestion = 'Bu yatırımı anlamlı kılacak en önemli sonuç sizin için nedir?';
    } else if (mood === 'Kararsız') {
      sayNow = 'Karar vermeden önce tereddüt ettiğiniz noktayı netleştirelim. Size daha fazla bilgi vermek yerine, kararınızı zorlaştıran tek konuyu konuşalım.';
      whyItWorks = 'Kararsızlığı bilgi bombardımanıyla büyütmez; asıl engeli görünür hale getirir.';
      nextQuestion = 'Şu anda karar vermenizi en çok zorlaştıran tek konu nedir?';
    } else {
      sayNow = 'İhtiyacınızı doğru anladıysam, sizin için en önemli sonucu netleştirip buna uygun seçeneği konuşalım.';
      whyItWorks = 'Satışı ürün anlatımından çıkarıp müşterinin ihtiyacına bağlar.';
      nextQuestion = 'Bu çözümden elde etmek istediğiniz en önemli sonuç nedir?';
    }
  }

  return {
    sayNow,
    whyItWorks,
    nextQuestion,
    riskFlag: legal ? 'legal' : (hardship ? 'sensitive' : 'none'),
    source: 'coaching-fallback',
  };
}

async function aiCoach(payload) {
  const { object } = await generateObject({
    model: 'openai/gpt-5.6-sol',
    schema: responseSchema,
    system: SYSTEM,
    prompt: `Çalışma alanı: ${payload.area}\nMüşterinin tam ifadesi: ${payload.customer}\nMüşterinin tutumu: ${payload.mood}\nGörüşme hedefi: ${payload.goal}\n\nBu dört girdiyi birlikte kullan. Müşterinin cümlesindeki asıl direnci/duyguyu isimlendirmeden sezdir. Görüşme hedefini gözden kaçırma. Şu üç çıktıyı üret: 1) temsilcinin şimdi söyleyeceği 1-3 doğal cümle, 2) bu özel durumda neden işe yaradığı, 3) hedefe ilerleten tek güçlü soru. Genel şablon verme.`,
    providerOptions: {
      gateway: {
        zeroDataRetention: true,
        tags: ['product:anlik-koc', 'feature:realtime-coaching'],
      },
    },
  });
  return { ...object, source: 'ai' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Yalnızca POST desteklenir.' });
  }

  const { area, customer, mood, goal } = req.body || {};
  if (!area || !customer || !mood || !goal) {
    return res.status(400).json({ error: 'Tüm alanları doldurun.' });
  }

  const payload = {
    area: String(area).slice(0, 80),
    customer: String(customer).trim().slice(0, 1200),
    mood: String(mood).slice(0, 80),
    goal: String(goal).slice(0, 120),
  };

  if (payload.customer.length < 3) {
    return res.status(400).json({ error: 'Müşterinin söylediğini biraz daha açıklayın.' });
  }

  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 6500));
    const answer = await Promise.race([aiCoach(payload), timeout]);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(answer);
  } catch (error) {
    console.error('ai_coach_fallback', error?.message || error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(fallbackCoach(payload));
  }
}
