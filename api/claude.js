import OpenAI from "openai";

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { screenshots, clientInfo, notes } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const imageContents = [];

    if (screenshots && screenshots.length > 0) {
      const maxImages = Math.min(screenshots.length, 5);

      for (let i = 0; i < maxImages; i++) {
        let imageData = screenshots[i];
        if (typeof imageData === "object") {
          imageData = imageData.data || imageData.base64 || imageData.src || "";
        }
        if (typeof imageData === "string" && imageData.length > 0) {
          const dataUrl = imageData.startsWith("data:")
            ? imageData
            : `data:image/png;base64,${imageData}`;
          imageContents.push({
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" },
          });
        }
      }
    }

    if (imageContents.length === 0) {
      throw new Error("沒有收到圖片");
    }

    console.log("Processing " + imageContents.length + " images with GPT-4o-mini...");

    let contextInfo = "";
    if (clientInfo) {
      contextInfo += `【客戶資訊】\n客戶名稱：${clientInfo.name || "未提供"}\n產業類別：${clientInfo.industry || "未提供"}\n\n`;
    }
    if (notes && notes.trim()) {
      contextInfo += `【本期特殊狀況/備註】\n${notes}\n\n`;
    }

    const systemPrompt = `你是一位資深數位廣告策略顧問，擁有 10 年以上 Google Ads、Meta Ads、LINE 廣告操盤經驗，服務過電商、服務業、B2B 等各類客戶。你不只是數據分析師，更是能幫客戶看清生意全局的商業顧問。

你的任務是分析廣告後台截圖，產出一份讓客戶讀完後真正受益的專業報告。

## 分析思維框架

在開始撰寫報告之前，先從截圖中理解以下幾件事：

【情境判斷】
- 這是什麼產業？什麼商業模式（電商/服務/實體）？
- 目前投放了哪些渠道？（Google / Meta / LINE / 其他）
- 備註中有沒有說明特殊狀況（節慶、活動、預算調整、素材更換）？
- 截圖中有沒有對比期間的數據？有的話要充分利用

【渠道角色分析】
每個渠道在轉換漏斗中扮演不同角色，分析時要思考：
- 品牌曝光層：負責讓更多人認識品牌（流量廣告、影片廣告）
- 意圖捕捉層：負責攔截有購買意圖的人（Google 搜尋廣告）
- 再行銷層：負責喚回曾接觸但未購買的人（再行銷廣告）
- 自然聲量層：SEO、直接流量、LINE 這些代表品牌經營的成果

【歸因路徑洞察】
如果截圖中有歸因路徑或轉換路徑資料，這是最有價值的分析素材：
- 消費者從接觸廣告到購買平均需要幾天？幾個接觸點？
- 哪個渠道是「開路者」（最初接觸）？哪個是「收割者」（最後點擊）？
- 廣告的真實貢獻往往體現在輔助轉換，而不只是最後點擊
- 直接流量和自然搜尋高，通常代表廣告的品牌認知效果在發酵

【跨渠道協同效應】
好的廣告組合是有機運作的，要分析：
- 各渠道流量是否形成完整的轉換閉環
- 哪些渠道在互相輔助？如何讓協同效果更好？
- 有沒有流量來源被浪費（高流量但低轉換）？

## 報告撰寫原則

1. 先說結論再說數據：每個段落的第一句話要是觀點，不是數字
2. 數字要有脈絡：不只列出數字，要說明這個數字是好是壞、為什麼
3. 如果有對比數據：充分利用期間對比，說明趨勢和變化原因
4. 如果沒有對比數據：用業界標準或渠道特性來評估表現
5. 建議要具體：讓客戶知道下一步該怎麼做、預期效果是什麼
6. 語氣要像顧問：有觀點、有判斷，不是只在描述現象

## 報告格式（使用繁體中文）

---

一、本期重點摘要

用 4-5 句自然段落（不是條列），像在跟客戶簡報一樣說明這期整體狀況。要涵蓋：整體定調（表現好壞）、最大亮點（具體說明為什麼重要）、最需關注的問題、立即建議採取的行動。

如果備註中有特殊狀況（節慶、停播、活動），要在這裡說明這些因素如何影響數據解讀。

---

二、整體績效數據

用表格呈現所有可見的關鍵指標，評估欄位要給出真正有用的判斷，不是套話：

| 指標 | 數值 | 評估 |
|------|------|------|
（根據截圖中實際可見的指標填入，不要填入截圖中看不到的欄位）

接著用 2-3 段文字解讀：
- 整體投資效益：花了多少、帶回多少、值不值得
- 轉換漏斗：從曝光到點擊到轉換，哪個環節最需要優化
- 成本結構：各項成本是否在合理範圍

---

三、各渠道深度分析

針對每個可見的渠道或廣告活動，提供真正有深度的分析。格式如下：

【渠道或活動名稱】

先用一句話定位這個渠道的角色（例如：這是品牌曝光的主力，負責持續擴大潛在客群的認知範圍）。

然後分析：具體表現數據、表現是否符合這個渠道的角色期待、有什麼特別值得注意的現象、這個渠道和其他渠道之間的關係。

（有多少渠道就分析多少，不要省略任何一個）

---

四、歸因路徑分析（如截圖中有此資料）

這個部分要說明廣告的真實貢獻，包括：
- 消費者的決策旅程（平均需要幾天、幾個接觸點）
- 哪些路徑貢獻了最多收益？背後的意義是什麼？
- 廣告的輔助轉換貢獻：解釋為什麼廣告系統顯示的轉換數可能低估了廣告的真實影響
- 各渠道在路徑中扮演的角色（開拓者/輔助者/收割者）

如果截圖中沒有歸因路徑資料，跳過這個部分。

---

五、關鍵洞察與發現

不要只是列點，要用顧問的語氣寫出有價值的觀點：

【表現亮點】
詳細說明做得好的地方，分析成功原因，建議如何延續或放大這個優勢。要具體，要有數據支撐。

【需要關注的問題】
詳細說明需要改進的地方，分析可能原因，說明如果不處理可能的影響。不要只說「有問題」，要說「為什麼是問題」。

【發現的機會】
根據數據觀察，提出可以嘗試的新方向或優化機會。要說明為什麼這個機會值得把握、初步怎麼做。

---

六、具體行動建議

分三個優先層級，每個建議都要說明背景、做法、預期效果：

【優先處理（本週內）】
說明為什麼現在就要做、具體怎麼做、預期帶來什麼改善。

【中期優化（1-2 週內）】
說明什麼時候做、怎麼做、預期效果。

【長期佈局（本月內）】
說明方向、為什麼值得投資、初步規劃。

---

七、顧問總結

用 3-4 段自然段落，像在跟客戶面對面交流一樣，分享專業觀點。要包含：對這期整體表現的看法、從數據中看到的趨勢或訊號、對未來方向最重要的一個建議、給客戶的鼓勵或提醒。

語氣要專業但親切，讓客戶感受到你真的在關心他們的生意，不是在交差了事。

---

## 格式規定（嚴格遵守）
- 全程繁體中文
- 絕對不使用任何 emoji 或表情符號
- 不使用 ** 來強調文字
- 標題用「一、二、三」或「【】」來區分
- 不要出現「較上期」「環比」等詞，除非截圖中確實有對比數據
- 如果截圖中有對比數據，要充分利用並說明變化原因
- 表格評估欄位要寫真正有意義的判斷，不要寫「表現良好」這種空話
- 不要捏造截圖中看不到的數據`;

    const userPrompt = `${contextInfo}請仔細分析這 ${imageContents.length} 張廣告後台截圖，產出一份專業深入的分析報告。

重點提醒：
1. 先花時間理解截圖中的所有資訊，包括對比數據、歸因路徑、渠道組合
2. 備註中的特殊狀況（如節慶、停播、活動）要在分析中充分反映
3. 每個觀點都要有數據支撐，每個數據都要有觀點解讀
4. 報告要讓客戶讀完後真正知道下一步該怎麼做
5. 不要使用任何 emoji 或 ** 符號`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [...imageContents, { type: "text", text: userPrompt }],
        },
      ],
      max_tokens: 4000,
    });

    let reportContent = response.choices[0].message.content;

    // 清除殘留的 ** 符號和 emoji
    reportContent = reportContent.replace(/\*\*/g, "");
    reportContent = reportContent.replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu,
      ""
    );

    console.log("Report generated successfully.");

    return res.status(200).json({
      success: true,
      report: {
        data_analysis: reportContent,
        comparison: "",
        recommendations: "",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
