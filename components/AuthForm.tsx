"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const text = await res.text();
      let data: { error?: string; redirect?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (!res.ok) return setError(data.error || "服务暂时不可用，请检查数据库连接");
      window.location.replace(data.redirect || "/dashboard");
    } catch (requestError) {
      setError(
        requestError instanceof DOMException && requestError.name === "AbortError"
          ? "登录请求超时，请检查数据库连接"
          : "无法连接服务，请稍后重试",
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }
  const register = mode === "register";
  return (
    <form onSubmit={submit}>
      <span className="eyebrow">{register ? "Create account" : "Welcome back"}</span>
      <h1>{register ? "创建你的工作空间" : "登录 iQuest"}</h1>
      <p className="intro">
        {register ? "首个注册账号将自动成为超级管理员。" : "继续管理问卷、答卷和统计。"}
      </p>
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}
      <div className="field">
        <label htmlFor="username">用户名</label>
        <input
          className="input"
          id="username"
          name="username"
          autoComplete="username"
          minLength={3}
          maxLength={24}
          required
          placeholder="3-24 位字符"
        />
      </div>
      <div className="field">
        <label htmlFor="password">密码</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          minLength={8}
          required
          placeholder="至少 8 位"
        />
      </div>
      <button className="btn btn-primary" disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? "请稍候" : register ? "注册并进入" : "登录"}
      </button>
      <div className="auth-switch">
        {register ? "已有账号？" : "还没有账号？"}{" "}
        <Link href={register ? "/login" : "/register"}>{register ? "登录" : "立即注册"}</Link>
      </div>
    </form>
  );
}
