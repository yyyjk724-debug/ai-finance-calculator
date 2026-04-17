async function runAI() {
    const assets = parseFloat(document.getElementById('assets').value);
    const savings = parseFloat(document.getElementById('savings').value);
    
    if(!assets || !savings) { alert("숫자를 입력해주세요!"); return; }

    document.getElementById('result').innerText = "AI가 계산 중...";

    // 간단한 AI 모델 만들기 (선형 회귀)
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 1, inputShape: [1]}));
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

    // 가상의 학습 데이터 (1개월 후 ~ 6개월 후 자산 추이)
    const xs = tf.tensor1d([1, 2, 3, 4, 5, 6]);
    const ys = tf.tensor1d([assets + savings, assets + savings*2, assets + savings*3, assets + savings*4, assets + savings*5, assets + savings*6]);

    // 브라우저에서 즉석 학습
    await model.fit(xs, ys, {epochs: 100});

    // 12개월 뒤 자산 예측
    const prediction = model.predict(tf.tensor1d([12]));
    const resultValue = await prediction.data();

    document.getElementById('result').innerText = 
        `AI 예측 1년 뒤 자산: 약 ${Math.round(resultValue[0]).toLocaleString()}만원`;
}
