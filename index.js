import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();

app.use(session({
    secret: 'M1nh4Chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 30
    }
}))

app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(process.cwd(), 'pages/public')));

const porta = 3000;
const host = '0.0.0.0';

const usuarios = [];
const mensagens = [];

function verificarAutenticacao(req, resp, next) {
    if (req.session.usuarioLogado) {
        next();
    } else {
        resp.redirect('/login');
    }
}

app.get('/login', (req, resp) => {
    if (req.session.usuarioLogado) {
        resp.redirect('/menu');
    } else {
        resp.redirect('login.html'); 
    }
});

app.post('/login', (req, resp) => {
    const { username, password } = req.body;
    const usuario = usuarios.find(u => u.nome === username);
    
    if (usuario && usuario.senha === password) {
        req.session.usuarioLogado = usuario.nome;
        resp.redirect('/menu');
    } else {
        resp.send(`
            <p>Credenciais inválidas. <a href="/login">Tente novamente</a>.</p>
        `);
    }
});

app.get('/logout', (req, resp) => {
    req.session.destroy();
    resp.redirect('/login');
});

app.get('/menu', verificarAutenticacao, (req, resp) => {
    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Menu</title>
            <link rel="stylesheet" href="/css/style.css">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
        </head>
        <body>
            <h1>Bem-vindo ao Menu</h1>
            <p>Você está logado como: <strong id="username"></strong></p>
            <p><a href="/logout">Sair</a></p>
            <p><a href="/chat">Ir para o Chat</a></p>

            <script>
                // Definindo o nome do usuário no HTML usando JavaScript
                const username = "${req.session.usuarioLogado}";
                document.getElementById('username').textContent = username;
            </script>
        </body>
        </html>
    `);
});

app.get('/cadastrarUsuario', (req, resp) => {
    resp.redirect('cadastro.html'); 
});

app.post('/cadastrarUsuario', (req, res) => {
    const { nome, dataNascimento, nickname, email, senha, confirmarSenha } = req.body;

    console.log('Dados recebidos:', req.body);

    if (!nome || !dataNascimento || !nickname || !senha || !confirmarSenha || !email) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    if (senha !== confirmarSenha) {
        return res.status(400).send('As senhas não coincidem.');
    }

    const usuarioExistenteEmail = usuarios.find(usuario => usuario.email === email);
    if (usuarioExistenteEmail) {
        return res.status(400).send('Este email já está em uso.');
    }

    const usuarioExistenteNickname = usuarios.find(usuario => usuario.nickname === nickname);
    if (usuarioExistenteNickname) {
        return res.status(400).send('Este nickname já está em uso.');
    }

    if (senha.length < 6) {
        return res.status(400).send('A senha deve ter no mínimo 6 caracteres.');
    }

    usuarios.push({ nome, dataNascimento, nickname, email, senha });

    res.redirect('/login');
});

app.get('/listarUsuarios', verificarAutenticacao, (req, resp) => {
    resp.write(`
        <html>
            <head>
                <title>Lista de Usuários</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
                <meta charset="utf-8">
            </head>
            <body>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Nome</th>
                            <th scope="col">Nickname</th>
                            <th scope="col">Email</th>
                        </tr>
                    </thead>
                    <tbody>`);
    
    for (const usuario of usuarios) {
        resp.write(`
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.nickname}</td>
                <td>${usuario.email}</td>
            </tr>
        `);
    }

    resp.write(`</tbody>
                </table>
                <a class="btn btn-secondary" href="/menu">Voltar para o Menu</a>
            </body>
        </html>`);
    resp.end();
});

app.post('/enviarMensagem', verificarAutenticacao, (req, res) => {
    const mensagem = {
        usuario: req.session.usuarioLogado,
        mensagem: req.body.mensagem,
        data: new Date().toLocaleString('pt-BR')
    };
    mensagens.push(mensagem); 
    res.redirect('/chat');
});

app.get('/chat', verificarAutenticacao, (req, resp) => {
    resp.redirect('/batePapo.html');
});

app.get('/mensagens', verificarAutenticacao, (req, res) => {
    res.json(mensagens);
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});