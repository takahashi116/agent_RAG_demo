# OpenAI Agent Chat

OpenAI APIキーを入力して、カスタムAIエージェントと会話できるウェブアプリケーションです。

## 特徴

- 🔐 **セキュアなAPIキー管理**: APIキーはローカルブラウザに保存され、OpenAI APIとの通信にのみ使用されます
- 💬 **リアルタイムチャット**: AIエージェントとリアルタイムで会話
- 🎨 **モダンなUI**: グラスモーフィズムとダークテーマを採用した美しいデザイン
- 📱 **レスポンシブ対応**: デスクトップ・モバイル両方で快適に利用可能

## ワークフローID

このアプリは以下のOpenAIエージェントワークフローと連携しています：
```
wf_694cd55399788190aaa361dc76a0775c09027f6e886535b0
```

## 使い方

1. [デプロイされたサイト](https://YOUR_USERNAME.github.io/openai-agent-chat/)にアクセス
2. OpenAI APIキーを入力
3. 「チャットを開始」をクリック
4. AIエージェントと会話を楽しむ

## GitHub Pagesへのデプロイ

### 1. リポジトリの作成

```bash
cd openai-agent-chat
git init
git add .
git commit -m "Initial commit"
```

### 2. GitHubリポジトリを作成してプッシュ

1. [GitHub](https://github.com/new)で新しいリポジトリを作成（例：`openai-agent-chat`）
2. 以下のコマンドでプッシュ：

```bash
git remote add origin https://github.com/YOUR_USERNAME/openai-agent-chat.git
git branch -M main
git push -u origin main
```

### 3. GitHub Pagesを有効化

1. リポジトリのSettingsに移動
2. 左サイドバーの「Pages」をクリック
3. 「Source」で「Deploy from a branch」を選択
4. 「Branch」で「main」を選択し、「/ (root)」を選択
5. 「Save」をクリック

数分後、`https://YOUR_USERNAME.github.io/openai-agent-chat/` でアプリにアクセスできます。

## 技術スタック

- HTML5
- CSS3（グラスモーフィズム、CSSアニメーション）
- Vanilla JavaScript
- OpenAI Responses API

## ライセンス

MIT License
