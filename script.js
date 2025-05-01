
const periodsContainer = document.getElementById('periods');
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');

urlForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const url = urlInput.value.trim(); // Obtém a URL inserida pelo usuário
    if (!url) {
        alert('Por favor, insira uma URL válida.');
        return;
    }

    // Limpa o conteúdo anterior
    periodsContainer.innerHTML = '';

    // Faz a chamada para a API com a URL fornecida
    fetch(`http://localhost:3000/api/curriculum?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            const subjectsByPeriod = {};
            const subjectCards = {}; // Para mapear os cards por código

            // Organizar as matérias por período
            Object.values(data).forEach(subject => {
                if (!subjectsByPeriod[subject.period]) {
                    subjectsByPeriod[subject.period] = [];
                }
                subjectsByPeriod[subject.period].push(subject);
            });

            // Criar os elementos HTML para cada período
            Object.keys(subjectsByPeriod).forEach(period => {
                const periodDiv = document.createElement('div');
                periodDiv.classList.add('period');

                const periodTitle = document.createElement('h2');
                periodTitle.textContent = period;
                periodDiv.appendChild(periodTitle);

                subjectsByPeriod[period].forEach(subject => {
                    const card = document.createElement('div');
                    card.classList.add('card');

                    // Exibir o nome da matéria com tamanho normal e negrito
                    const subjectTitle = document.createElement('span');
                    subjectTitle.textContent = subject.name;
                    subjectTitle.style.fontWeight = 'bold'; // Define o texto como negrito
                    card.appendChild(subjectTitle);

                    // Exibir o código e os créditos da matéria
                    const subjectDetails = document.createElement('p');
                    subjectDetails.textContent = `Código: ${subject.code} | Créditos: ${subject.credits}`;
                    card.appendChild(subjectDetails);

                    // Criar o tooltip com pré-requisitos e dependentes
                    const prerequisites = subject.prerequisites.length > 0
                        ? `Pré-requisitos: ${subject.prerequisites.join(', ')}`
                        : 'Sem pré-requisitos';
                    const dependents = Object.values(data)
                        .filter(otherSubject => otherSubject.prerequisites.includes(subject.code))
                        .map(dependent => dependent.code)
                        .join(', ');
                    const dependentsText = dependents ? `Dependentes: ${dependents}` : 'Sem dependentes';

                    // Adicionar o tooltip ao card
                    card.title = `${prerequisites}\n${dependentsText}`;

                    // Mapear o card pelo código da matéria
                    subjectCards[subject.code] = card;

                    // Adicionar evento de clique para trocar a cor
                    card.addEventListener('click', () => {
                        // Resetar os estilos de todos os cards
                        document.querySelectorAll('.card').forEach(c => {
                            c.classList.remove('selected', 'prerequisite', 'dependent');
                        });

                        // Destacar o card atual
                        card.classList.add('selected');

                        // Destacar os pré-requisitos
                        subject.prerequisites.forEach(prerequisiteCode => {
                            if (subjectCards[prerequisiteCode]) {
                                subjectCards[prerequisiteCode].classList.add('prerequisite');
                            }
                        });

                        // Destacar os dependentes
                        Object.values(data).forEach(otherSubject => {
                            if (otherSubject.prerequisites.includes(subject.code)) {
                                if (subjectCards[otherSubject.code]) {
                                    subjectCards[otherSubject.code].classList.add('dependent');
                                }
                            }
                        });
                    });

                    periodDiv.appendChild(card);
                });

                periodsContainer.appendChild(periodDiv);
            });
        })
        .catch(error => console.error('Error fetching subjects:', error));
});
