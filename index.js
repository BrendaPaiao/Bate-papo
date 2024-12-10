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

const admin = {nome: 'Admin', senha: '1234'};

var usuarios = [];
const mensagens = [];

function verificarAutenticacao(req, resp, next) {
    if (req.session.usuarioLogado) {
      next();
    } else {
      console.log("Usuário não autenticado.");
      next(); 
    }
  }

app.get('/login', (req, resp) => {
    if (req.session.usuarioLogado) {
        resp.redirect('/menu.html');
    } else {
        resp.send(`...pagina de login aqui...`);
    }
});

app.post('/login', (req, resp) => {
    const { nome, senha } = req.body;
    if (admin.nome === nome && admin.senha === senha) {
        req.session.usuarioLogado = admin.nome;
        resp.cookie('dataHoraUltimoLogin', new Date().toISOString(), { maxAge: 1000 * 60 * 30 });
        resp.redirect('/menu.html');
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
    const dataHoraUltimoLogin = req.cookies['dataHoraUltimoLogin'];
    if (!dataHoraUltimoLogin) {
        dataHoraUltimoLogin = '';
    }
});

function cadastroUsuario(req, resp) {
    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Usuário</title>
            <link rel="stylesheet" href="styles/styles.css">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
        </head>
        <body>
            <h1>Cadastro de Usuário</h1>
            <form action="/cadastrarUsuario" method="POST" autocomplete="on">
                <div class="mb-3">
                    <label for="nome" class="form-label">Nome</label>
                    <input type="text" id="nome" name="nome" placeholder="Nome" class="form-control" autocomplete="name">
                </div>
                <div class="mb-3">
                    <label for="dataNascimento" class="form-label">Data de Nascimento</label>
                    <input type="date" id="dataNascimento" name="dataNascimento" placeholder="Data de Nascimento" class="form-control" autocomplete="bday">
                </div>
                <div class="mb-3">
                    <label for="nickname" class="form-label">Nickname</label>
                    <input type="text" id="nickname" name="nickname" placeholder="Nickname" class="form-control" autocomplete="username">
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" name="email" placeholder="Email" class="form-control" autocomplete="email">
                </div>
                <div class="mb-3">
                    <label for="senha" class="form-label">Senha</label>
                    <input type="password" id="senha" name="senha" placeholder="Senha" class="form-control" autocomplete="new-password">
                </div>
                <div class="mb-3">
                    <label for="confirmarSenha" class="form-label">Confirmar Senha</label>
                    <input type="password" id="confirmarSenha" name="confirmarSenha" placeholder="Confirmar Senha" class="form-control" autocomplete="new-password">
                </div>
                <button type="submit" class="btn btn-primary">Cadastrar</button>
            </form>
            <a href="/menu" class="btn btn-primary" role="button">Voltar</a>
        </body>
        </html>`);
}

function cadastrarUsuarios(req, resp) {

    const nome = req.body.nome;
    const dataNascimento = req.body.dataNascimento;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const senha = req.body.senha;
    const confirmarSenha = req.body.confirmarSenha;

    if (nome && dataNascimento && nickname && email && senha && senha === confirmarSenha) {

        const usuario = {nome, dataNascimento, nickname, email, senha};
        usuarios.push(usuario);

        resp.write(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Usuário</title>
                <link rel="stylesheet" href="styles/styles.css">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            </head>
            <body>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Nome</th>
                            <th scope="col">Data de Nascimento</th>
                            <th scope="col">Nickname</th>
                            <th scope="col">Email</th>
                            <th scope="col">Senha</th>
                        </tr>
                    </thead>
                    <tbody>`);

        for (let i = 0; i < usuarios.length; i++) {
            resp.write(`
                <tr>
                    <td>${usuarios[i].nome}</td>
                    <td>${usuarios[i].dataNascimento}</td>
                    <td>${usuarios[i].nickname}</td>
                    <td>${usuarios[i].email}</td>
                    <td>${usuarios[i].senha}</td>
                </tr>
            `);
        }

        resp.write(`
                    </tbody>
                </table>
                <div class="container-actions">
                    <a class="btn btn-primary" href="/cadastrarUsuario" role="button">Cadastrar Outro Usuário</a>
                    <a class="btn btn-primary" href="/menu" role="button">Voltar ao Menu</a>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        </html>
        `);
    } else {
        
        resp.write(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Usuário</title>
                <link rel="stylesheet" href="styles/styles.css">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            </head>
            <body>
                <h1>Cadastro de Usuário</h1>
                <form action="/cadastrarUsuario" method="POST" autocomplete="on">
                    <div class="mb-3">
                        <label for="nome" class="form-label">Nome</label>
                        <input type="text" id="nome" name="nome" placeholder="Nome" class="form-control" value="${nome || ''}">
                        ${!nome ? '<span><p class="text-danger">Por favor, informe o nome do usuário.</p></span>' : ''}
                    </div>
                    <div class="mb-3">
                        <label for="dataNascimento" class="form-label">Data de Nascimento</label>
                        <input type="date" id="dataNascimento" name="dataNascimento" placeholder="Data de Nascimento" class="form-control" value="${dataNascimento || ''}">
                        ${!dataNascimento ? '<span><p class="text-danger">Por favor, informe a data de nascimento do usuário.</p></span>' : ''}
                    </div>
                    <div class="mb-3">
                        <label for="nickname" class="form-label">Nickname</label>
                        <input type="text" id="nickname" name="nickname" placeholder="Nickname" class="form-control" value="${nickname || ''}">
                        ${!nickname ? '<span><p class="text-danger">Por favor, informe o nickname do usuário.</p></span>' : ''}
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" name="email" placeholder="Email"  class="form-control" value="${email || ''}">
                        ${!email ? '<span><p class="text-danger">Por favor, informe o email do usuário.</p></span>' : ''}
                    </div>
                    <div class="mb-3">
                        <label for="senha" class="form-label">Senha</label>
                        <input type="password" id="senha" name="senha" placeholder="Senha"  class="form-control" value="${senha || ''}">
                        ${!senha ? '<span><p class="text-danger">Por favor, informe a senha do usuário.</p></span>' : ''}
                    </div>
                    <div class="mb-3">
                        <label for="confirmarSenha" class="form-label">Confirmar Senha</label>
                        <input type="password" id="confirmarSenha" name="confirmarSenha" placeholder="Confirmar Senha"  class="form-control" value="${confirmarSenha || ''}">
                        ${senha !== confirmarSenha ? '<span><p class="text-danger">As senhas não coincidem.</p></span>' : ''}
                    </div>
                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                </form>
                <a href="/menu">Voltar</a>
            </body>
            </html>
        `);
    }
    resp.end();
}

app.get('/cadastrarUsuario', verificarAutenticacao, cadastroUsuario);

app.post('/cadastrarUsuario', verificarAutenticacao, cadastrarUsuarios);

app.post('/enviarMensagem', verificarAutenticacao, (req, resp) => {
    const { mensagem } = req.body;
    const usuarioRemetente = req.session.usuarioLogado;

    if (mensagem && usuarioRemetente) {
        //Conteúdo da mensagem que será enviada no bate-papo
        const novaMensagem = {
            usuario: usuarioRemetente.nickname,
            mensagem: mensagem,
            data: new Date().toLocaleString(),
        };

        mensagens.push(novaMensagem);
        //Para informar que a ação foi executada com sucesso
        resp.json({ success: true });
    } else {
        resp.send('Por favor, preencha o campo de mensagem.');
    }
});

app.get('/usuarios', (req, res) => {
    const nicknames = usuarios.map(u => u.nickname);
    res.json(nicknames);
});


app.get('/chat', verificarAutenticacao, (req, resp) => {
    if (!req.session.usuarioLogado) {
        return resp.send('<h1>Por favor, faça login para acessar o chat.</h1>');
    }
    resp.redirect('/batePapo.html');
});

app.get('/mensagens', verificarAutenticacao, (req, resp) => {
    //Enviando no formato json
    resp.json(mensagens);
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
