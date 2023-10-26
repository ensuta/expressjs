let index = 0;
            let hanjaData; // 한자 데이터를 저장할 변수
            
            const hanjaElement = document.getElementById('hanja');            
            const hangulElement = document.getElementById('hangul');
            const umElement = document.getElementById('um');
            const hunElement = document.getElementById('hun');
            const randomcheckbox = document.getElementById('random');
            const hidehanjacheckbox = document.getElementById('hidehanja');
            const hidehangulcheckbox = document.getElementById('hidehangul');
            const hideumcheckbox = document.getElementById('hideum');
            const hidehuncheckbox = document.getElementById('hidehun');

            // JSON 파일 로드
            fetch('hanjajson')
                .then(response => response.json())
                .then(data => {
                    hanjaData = data;
                    updateHanjaData(index);
                });

            hidehanjacheckbox.addEventListener('change', function() {
                if (hidehanjacheckbox.checked) {
                    hanjaElement.style.visibility = 'hidden';
                } else {
                    hanjaElement.style.visibility = 'visible';
                }
            });

            hidehangulcheckbox.addEventListener('change', function() {
                if (hidehangulcheckbox.checked) {
                    hangulElement.style.visibility = 'hidden';
                } else {
                    hangulElement.style.visibility = 'visible';
                }
            });

            hideumcheckbox.addEventListener('change', function() {
                if (hideumcheckbox.checked) {
                    umElement.style.visibility = 'hidden';
                } else {
                    umElement.style.visibility = 'visible';
                }
            });

            hidehuncheckbox.addEventListener('change', function() {
                if (hidehuncheckbox.checked) {
                    hunElement.style.visibility = 'hidden';
                } else {
                    hunElement.style.visibility = 'visible';
                }
            });

            function prev() {
                if (randomcheckbox.checked) {
                    index = Math.floor(Math.random() * 2136);
                    updateHanjaData(index);     
                }
                else{
                    if (index > 0) {
                        index--;
                        updateHanjaData(index);
                    }
                }
            }

            function next() {
                if(randomcheckbox.checked) {
                    index = Math.floor(Math.random() * 2136);
                    updateHanjaData(index);
                }
                else{

                    if (index < hanjaData.length - 1) {
                        index++;
                        updateHanjaData(index);
                    }
                }
            }

            function updateHanjaData(index) {
                const hanjaElement = document.getElementById('hanja');
                const hangulElement = document.getElementById('hangul');
                const umElement = document.getElementById('um');
                const hunElement = document.getElementById('hun');
                const indexoutputElement = document.getElementById('indexoutput');

                if (hanjaData && index >= 0 && index < hanjaData.length) {
                    const currentHanja = hanjaData[index];
                    hanjaElement.innerText = Object.values(currentHanja)[0][0];
                    hangulElement.innerText = Object.keys(currentHanja);
                    umElement.innerText ="음독 : " + Object.values(currentHanja)[0][1];
                    hunElement.innerText ="훈독 : " + Object.values(currentHanja)[0][2];
                    indexoutputElement.innerText = (index+1) + " / 2136";
                }
            }

            function updateOnEnter(event) {
                if (event.key === 'Enter') {
                    const newIndex = parseInt(document.getElementById('index-input').value);
                    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < hanjaData.length) {
                        index = newIndex;
                        if(index > hanjaData.length - 1 || index < 0){
                            return;
                        }
                        index++;
                        updateHanjaData(index);
                    }
                }
            }