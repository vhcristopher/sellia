<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4 text-white"
  >
    <div class="z-10 -mt-12 flex h-24 w-24 items-center justify-center">
      <img
        src="@/assets/colibri.png"
        alt="Colibrí Logo"
        class="rounded-full object-cover shadow-lg"
      />
    </div>

    <div
      class="mt-4 w-full max-w-2xl rounded-lg bg-white p-6 pt-14 text-gray-800 shadow-lg"
    >
      <h2 class="mb-3 text-center text-2xl font-bold text-gray-700">
        Bienvenido, {{ userName }}
      </h2>

      <p class="mb-3 text-center text-gray-500">
        Usuarios conectados en la sala: {{ userCount }}
      </p>

      <div
        v-if="toast.visible"
        :class="[
          'fixed right-4 top-10 flex items-center rounded-lg p-4 text-lg shadow-lg transition-opacity duration-500',
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white',
          toast.visible ? 'opacity-90' : 'opacity-0',
        ]"
        style="max-width: 30%; z-index: 9999"
      >
        <span class="mr-2 text-2xl">{{
          toast.type === "success" ? "✅" : "🚫"
        }}</span>
        <span class="text-center">{{ toast.message }}</span>
      </div>

      <div
        class="messages mb-4 h-72 overflow-y-scroll rounded-lg bg-gray-100 p-4"
      >
        <div
          v-for="message in messages.slice().reverse()"
          :key="message._id"
          :class="getMessageClass(message.sender)"
          :style="{ backgroundColor: getUserColor(message.sender) }"
          class="relative mb-2 max-w-xs rounded-lg p-3"
        >
          <strong v-if="message.sender !== userName" class="text-gray-700"
            >{{ message.sender }}:</strong
          >
          <div class="message-text">{{ message.text }}</div>

          <div v-if="message.filePath" class="mt-2">
            <template v-if="isImageFile(message.filePath)">
              <img
                :src="getFileURL(message.filePath)"
                alt="Imagen enviada"
                class="max-w-full rounded-lg"
              />
            </template>
            <template v-else>
              <a
                :href="getFileURL(message.filePath)"
                download
                class="text-blue-500 underline"
                >Descargar archivo</a
              >
            </template>
          </div>

          <div class="message-time">
            {{ formatTimestamp(message.timestamp) }}
          </div>
        </div>
      </div>

      <form @submit.prevent="uploadFile" class="mb-2">
        <div class="flex items-center space-x-2">
          <input
            type="file"
            @change="onFileSelected"
            class="hidden"
            ref="fileInput"
          />
          <button
            type="button"
            @click="triggerFileSelect"
            class="w-3/4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 font-semibold text-white transition duration-300 hover:from-blue-600 hover:to-purple-700"
          >
            Seleccionar Archivo
          </button>
          <button
            type="submit"
            :disabled="isUploading"
            class="w-1/4 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 p-2 font-semibold text-white transition duration-300 hover:from-green-600 hover:to-teal-700"
            :class="{ 'cursor-not-allowed opacity-50': isUploading }"
          >
            Subir
          </button>
        </div>

        <p
          v-if="selectedFile && !isUploading"
          class="mt-1 flex items-center text-sm font-semibold text-green-600"
        >
          ✅ Archivo listo: {{ selectedFile.name }}
        </p>
      </form>

      <div class="mb-2 flex items-center space-x-2">
        <button @click="toggleEmojiPicker" class="rounded-full bg-gray-300 p-2">
          😊
        </button>
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Escribe un mensaje"
          class="w-3/4 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="sendMessage"
          class="w-1/4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 font-semibold text-white transition duration-300 hover:from-blue-600 hover:to-purple-700"
        >
          Enviar
        </button>
      </div>

      <input
        v-model="searchQuery"
        @input="searchMessages"
        placeholder="Buscar en el historial"
        class="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { EmojiButton } from "@joeattardi/emoji-button";

export default {
  data() {
    return {
      messages: [],
      newMessage: "",
      searchQuery: "",
      selectedFile: null,
      roomID: "defaultRoom",
      userName: localStorage.getItem("userName") || "Anon",
      emojiPicker: null,
      isUploading: false,
      toast: { visible: false, message: "", type: "success" },
      userColors: {},
      userCount: 1,
    };
  },
  mounted() {
    if (!this.userName) {
      this.$router.push("/");
      return;
    }

    this.$socket.emit("joinRoom", {
      roomID: this.roomID,
      userName: this.userName,
    });

    this.$socket.on("message", (message) => {
      this.messages.push(message);
    });

    this.$socket.on("fileMessage", (fileMessage) => {
      this.messages.push(fileMessage);
    });

    this.$socket.on("updateUserCount", (count) => {
      this.userCount = count;
    });

    this.$socket.on("botMessage", (botMessage) => {
      this.messages.push(botMessage);
    });

    this.loadMessages();

    this.emojiPicker = new EmojiButton();
    this.emojiPicker.on("emoji", (emoji) => this.addEmoji(emoji.emoji));
    window.addEventListener("unload", () => this.disconnectSocket());
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.disconnectSocket);
    this.disconnectSocket();
  },

  methods: {
    disconnectSocket() {
      this.$socket.disconnect();
    },

    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },
    async uploadFile() {
      if (!this.selectedFile) {
        this.showToast("Por favor, selecciona un archivo", "error");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.selectedFile);
      formData.append("roomID", this.roomID);
      formData.append("sender", this.userName);
      this.isUploading = true;

      try {
        await axios.post("http://localhost:5000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        this.showToast("Archivo subido con éxito", "success");
        this.selectedFile = null;
      } catch (error) {
        console.error("Error al subir el archivo:", error);
        this.showToast("Ocurrió un error al subir el archivo", "error");
      } finally {
        this.isUploading = false;
      }
    },
    showToast(message, type) {
      this.toast = { visible: true, message, type };

      setTimeout(() => {
        this.toast.visible = false;
      }, 3000);
    },
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    async loadMessages(query = "") {
      try {
        const response = await axios.get(
          `http://localhost:5000/messages/${this.roomID}`,
          {
            params: { query },
          },
        );
        this.messages = response.data;
      } catch (error) {
        console.error(
          "Error al cargar mensajes:",
          error.response || error.message,
        );
      }
    },
    async sendMessage() {
      const regex = /^[\p{L}\p{N}\s\p{Emoji_Presentation}]+$/u;

      if (!regex.test(this.newMessage.trim())) {
        this.showToast(
          "No se permiten caracteres especiales, excepto emojis",
          "error",
        );
        return;
      }

      if (!this.newMessage.trim()) return;

      const message = {
        roomID: this.roomID,
        sender: this.userName,
        text: this.newMessage,
        timestamp: new Date(),
      };
      this.$socket.emit("chatMessage", message);
      await axios.post("http://localhost:5000/messages", message);

      this.newMessage = "";
    },
    searchMessages() {
      this.loadMessages(this.searchQuery);
    },
    getMessageClass(sender) {
      return sender === this.userName
        ? "text-black self-end ml-auto"
        : "text-black self-start mr-auto";
    },
    getUserColor(sender) {
      if (!this.userColors[sender]) {
        this.userColors = {
          ...this.userColors,
          [sender]: this.getRandomTransparentColor(),
        };
      }
      return this.userColors[sender];
    },
    getRandomTransparentColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgba(${r}, ${g}, ${b}, 0.4)`;
    },
    toggleEmojiPicker() {
      this.emojiPicker.togglePicker(document.querySelector(".p-2"));
    },
    addEmoji(emoji) {
      this.newMessage += emoji;
    },
    isImageFile(filePath) {
      const imageExtensions = ["jpg", "jpeg", "png", "gif"];
      const extension = filePath.split(".").pop().toLowerCase();
      return imageExtensions.includes(extension);
    },
    getFileURL(filePath) {
      return `http://localhost:5000${filePath}`;
    },
  },
};
</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
}
.self-start {
  align-self: flex-start;
}
.self-end {
  align-self: flex-end;
}
.message-time {
  font-size: 0.75rem;
  color: #666;
  text-align: right;
  margin-top: 4px;
}
</style>
