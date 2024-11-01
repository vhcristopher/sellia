<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white sm:p-8"
  >
    <div
      class="relative w-full max-w-xs rounded-lg bg-white p-8 text-gray-800 shadow-lg sm:max-w-sm md:max-w-md lg:max-w-lg"
    >
      <!-- Logo Colibrí -->
      <div
        class="absolute -top-20 left-1/2 flex -translate-x-1/2 transform items-center justify-center shadow-lg"
      >
        <img
          src="@/assets/colibri.png"
          alt="Colibrí Logo"
          class="h-40 w-40 rounded-full"
        />
      </div>

      <h1 class="mb-6 mt-24 text-center text-3xl font-bold text-gray-700">
        Bienvenido al Chat
      </h1>
      <input
        v-model="userName"
        placeholder="Ingresa tu nombre"
        @keyup.enter="enterChat"
        class="mb-4 w-full rounded-lg border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="enterChat"
        class="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-3 font-semibold text-white transition duration-300 hover:from-blue-600 hover:to-purple-700"
      >
        Entrar al Chat
      </button>
    </div>

    <!-- Toast de error -->
    <div
      v-show="toast.visible"
      :class="[
        'fixed inset-x-0 top-10 mx-auto flex items-center justify-center rounded-lg p-4 text-center text-lg shadow-lg transition-opacity duration-500',
        toast.type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white',
      ]"
      style="width: 90vw; max-width: 30%"
    >
      <span class="mr-2 text-2xl">
        {{ toast.type === "success" ? "✅" : "🚫" }}
      </span>
      <span class="text-center">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomePage",
  data() {
    return {
      userName: "",
      toast: { visible: false, message: "", type: "error" },
    };
  },
  methods: {
    enterChat() {
      const regex = /^[a-zA-Z0-9]+$/;

      if (!this.userName.trim()) {
        this.showToast("Por favor, ingresa un nombre de usuario.", "error");
      } else if (!regex.test(this.userName)) {
        this.showToast("Solo se permiten letras y números.", "error");
      } else {
        localStorage.setItem("userName", this.userName);
        this.$router.push("/chat");
      }
    },
    showToast(message, type) {
      this.toast = { visible: true, message, type };

      setTimeout(() => {
        this.toast.visible = false;
      }, 3000);
    },
  },
  beforeUnmount() {
    this.toast.visible = false;
  },
};
</script>

<style scoped>
/* Estilos adicionales para el toast y ajuste responsivo */
.fixed {
  position: fixed;
  .top-10 {
    top: 2.5rem;
  }
  .inset-x-0 {
    left: 0;
    right: 0;
  }
}

@media (min-width: 320px) {
  .max-w-xs {
    margin: 0 auto; /* Asegura que la tarjeta esté centrada en pantallas pequeñas */
  }
}

.opacity-90 {
  opacity: 0.9;
}

.opacity-0 {
  opacity: 0;
}
</style>
