// ========================================
// CHECKOUT SCRIPT - Professional & Modern
// MovAccess Checkout Functionality
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initCheckout();
});

// Função para voltar à página anterior
function voltarPaginaAnterior() {
    // Verifica se há histórico de navegação
    if (window.history.length > 1 && document.referrer && document.referrer !== window.location.href) {
        window.history.back();
        return;
    }
    // Fallback: prioriza URL específica do plano (quando definida)
    const fallbackUrl = window.VOLTAR_URL || '../index.html#servicos';
    window.location.href = fallbackUrl;
}

function initCheckout() {
    // Payment method selection
    const paymentBtns = document.querySelectorAll('.payment-method-btn');
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.dataset.method;
            selectPaymentMethod(method);
        });
    });

    // Form validation
    setupFormValidation();

    // Form submission
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Input masks
    setupInputMasks();

    // CEP lookup
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', lookupCEP);
    }

    // Generate payment codes
    generatePaymentCodes();
}

// Payment Method Selection
function selectPaymentMethod(method) {
    // Update buttons
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');

    // Show/hide payment details
    document.querySelectorAll('.payment-details').forEach(detail => {
        detail.classList.remove('active');
    });

    const paymentDetail = document.getElementById(`${method}-payment`);
    if (paymentDetail) {
        paymentDetail.classList.add('active');
        
        // Generate codes if needed
        if (method === 'pix') {
            generatePixCode();
        } else if (method === 'boleto') {
            generateBoletoCode();
        }
    }
}

// Form Validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('invalid')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const errorDiv = field.parentElement.querySelector('.form-group-error');
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove previous states
    field.classList.remove('valid', 'invalid');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }

    // Check if required
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }

    // Specific validations
    if (value && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'E-mail inválido';
        }
    }

    if (value && field.id === 'cpf') {
        const cpf = value.replace(/\D/g, '');
        if (cpf.length !== 11 || !isValidCPF(cpf)) {
            isValid = false;
            errorMessage = 'CPF inválido';
        }
    }

    if (value && field.id === 'telefone') {
        const phone = value.replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 11) {
            isValid = false;
            errorMessage = 'Telefone inválido';
        }
    }

    if (value && field.id === 'cep') {
        const cep = value.replace(/\D/g, '');
        if (cep.length !== 8) {
            isValid = false;
            errorMessage = 'CEP inválido';
        }
    }

    if (value && field.id === 'card-number') {
        const card = value.replace(/\s/g, '');
        if (card.length < 13 || card.length > 19 || !luhnCheck(card)) {
            isValid = false;
            errorMessage = 'Número de cartão inválido';
        }
    }

    if (value && field.id === 'card-expiry') {
        const expiry = value.replace(/\D/g, '');
        if (expiry.length !== 4) {
            isValid = false;
            errorMessage = 'Data inválida';
        } else {
            const month = parseInt(expiry.substring(0, 2));
            const year = parseInt('20' + expiry.substring(2, 4));
            const now = new Date();
            if (month < 1 || month > 12 || year < now.getFullYear() || 
                (year === now.getFullYear() && month < now.getMonth() + 1)) {
                isValid = false;
                errorMessage = 'Data inválida ou expirada';
            }
        }
    }

    if (value && field.id === 'card-cvv') {
        const cvv = value.replace(/\D/g, '');
        if (cvv.length < 3 || cvv.length > 4) {
            isValid = false;
            errorMessage = 'CVV inválido';
        }
    }

    // Apply visual feedback
    if (value) {
        if (isValid) {
            field.classList.add('valid');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        } else {
            field.classList.add('invalid');
            if (errorDiv) {
                errorDiv.style.display = 'flex';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
            }
        }
    }

    return isValid;
}

// CPF Validation
function isValidCPF(cpf) {
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// Luhn Algorithm for Card Validation
function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));

        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

// Input Masks
function setupInputMasks() {
    // CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            }
        });
    }

    // CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Card Number
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }

    // Card Expiry
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // CVV
    const cvvInput = document.getElementById('card-cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// CEP Lookup
async function lookupCEP() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('endereco').value = data.logradouro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf || '';
            document.getElementById('complemento').focus();
        }
    } catch (error) {
        // Silencioso em produção: falha de CEP não bloqueia checkout
    }
}

// Generate Payment Codes
function generatePaymentCodes() {
    generatePixCode();
    generateBoletoCode();
}

function generatePixCode() {
    const pixCodeElement = document.getElementById('pix-code');
    if (pixCodeElement && pixCodeElement.textContent === 'Gerando código PIX...') {
        // Simular geração de código PIX
        setTimeout(() => {
            const pixCode = '00020126360014BR.GOV.BCB.PIX0114+55119999999990204000053039865802BR5925MOVACCESS LTDA6009SAO PAULO62070503***6304';
            pixCodeElement.textContent = pixCode;
            pixCodeElement.dataset.code = pixCode;
        }, 500);
    }
}

function generateBoletoCode() {
    const boletoElement = document.getElementById('boleto-code');
    if (boletoElement && boletoElement.textContent === 'Gerando código de barras...') {
        setTimeout(() => {
            const boletoCode = '34191.79001 01043.510047 91020.150008 1 84210000009900';
            boletoElement.textContent = boletoCode;
            boletoElement.dataset.code = boletoCode;
        }, 500);
    }
}

// Copy PIX Code
function copiarPixCode() {
    const pixCode = document.getElementById('pix-code').dataset.code || 
                    document.getElementById('pix-code').textContent;
    
    navigator.clipboard.writeText(pixCode).then(() => {
        const btn = event.target.closest('.pix-copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        btn.style.background = '#00A86B';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    });
}

// Download Boleto
function baixarBoleto() {
    const boletoCode = document.getElementById('boleto-code').textContent;
    alert('Funcionalidade de download de boleto será implementada com integração bancária real.');
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('btn-submit');
    const activePaymentMethod = document.querySelector('.payment-method-btn.active');
    
    if (!activePaymentMethod) {
        alert('Por favor, selecione um método de pagamento');
        return;
    }

    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        alert('Por favor, preencha todos os campos corretamente');
        return;
    }

    // Show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    form.classList.add('form-loading');

    // Simulate payment processing
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.classList.remove('form-loading');

        // Show success message
        const successMessage = document.getElementById('success-message');
        successMessage.classList.add('active');

        // Scroll to success
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Redirect after delay: página de confirmação elegante
        setTimeout(() => {
            const plano = encodeURIComponent(window.PLANO_NOME || 'Plano');
            const metodo = encodeURIComponent((activePaymentMethod && activePaymentMethod.dataset.method) || 'indefinido');
            const totalEl = document.querySelector('.summary-total span:last-child');
            const valor = encodeURIComponent(totalEl ? totalEl.textContent.trim() : '');
            const ts = Date.now();
            window.location.href = `sucesso.html?plano=${plano}&valor=${valor}&metodo=${metodo}&ts=${ts}`;
        }, 3000);
    }, 2000);
}

