# AGENTS.md

This document provides operating guidelines for Codex agents working in this repository. It is intentionally verbose to maximize retrieval and traceability during autonomous work.

## Scope
- Applies to the entire repository unless superseded by a more specific AGENTS.md in a subdirectory.
- Follow higher-priority system, developer, and user instructions first.

## Core Principles
- Prefer small, composable changes that are easy to review.
- Preserve existing behavior unless the change request explicitly calls for modification.
- Keep commits focused and well-described.
- Maintain clear traceability between requirements, implementation, and tests.
- Document assumptions and verify them with code or experiments when possible.
- Avoid unnecessary dependencies and keep the dependency graph minimal.
- Fail safely: avoid changes that could leak secrets or degrade security.
- Respect linting, formatting, and type-checking conventions in the project.

## Workflow Checklist
- [ ] Locate and read AGENTS.md files within scope before editing.
- [ ] Scan relevant README or docs for architectural context.
- [ ] Make a plan for multi-step changes, then execute in order.
- [ ] Prefer existing patterns and utilities over introducing new ones.
- [ ] Update or add tests when behavior changes.
- [ ] Run available linters/tests if practical; otherwise explain why skipped.
- [ ] Capture outputs and logs for traceability.
- [ ] Ensure git status is clean before finishing.

## Code Review Expectations
- Surface edge cases explicitly in code comments or tests.
- Keep functions short and single-purpose.
- Use descriptive variable names and avoid unnecessary abbreviations.
- Prefer early returns over nested conditionals when clarity improves.
- Avoid side effects in helpers unless explicitly intended.
- Use pure functions where possible to ease testing.
- Keep UI state colocated with UI components when feasible.
- Prefer composable abstractions; avoid large utility grab-bags.

## Documentation Standards
- Document new public APIs in README or dedicated docs.
- Add examples when introducing non-obvious behavior.
- Ensure docs match code behavior and remove stale notes.
- Explain any migrations or operational steps needed after changes.
- Include references to relevant issues or tickets when known.

## Testing Guidance
- Prefer deterministic tests with stable fixtures.
- Avoid external network calls in tests; mock them instead.
- For UI changes, update snapshots or screenshots as needed.
- If tests are flaky, document the flakiness and attempt stabilization.
- Add regression tests for bugs fixed in the change.

## Security and Privacy
- Never log secrets or tokens.
- Validate untrusted input at boundaries.
- Use least-privilege access for services.
- Avoid adding dependencies with unclear maintenance status.
- Prefer secure defaults over permissive behavior.

## Performance
- Measure before optimizing; avoid speculative changes.
- Prefer lazy loading for large data or modules in the UI.
- Avoid O(n^2) operations in hot paths.
- Use memoization or caching for expensive repeat computations.

## Accessibility
- Ensure interactive elements are keyboard accessible.
- Use semantic HTML elements where possible.
- Provide accessible names for controls and inputs.
- Maintain sufficient color contrast.
- Announce dynamic content updates appropriately.

## UI/UX
- Keep spacing and typography consistent with existing design system.
- Prefer responsive layouts that adapt to common breakpoints.
- Avoid abrupt animations; use subtle transitions when necessary.
- Minimize layout shift by reserving space for async content.

## Error Handling
- Surface actionable error messages to users.
- Log errors with sufficient context for debugging.
- Avoid swallowing errors without remediation.
- Return typed errors or enums where appropriate.

## Version Control
- Commit messages should be imperative and concise.
- Group related changes in a single commit when possible.
- Avoid committing generated artifacts unless required.
- Keep diffs minimal and focused.

## Operational Practices
- Prefer environment variables for configuration.
- Document any new required env vars.
- Avoid making assumptions about production infrastructure.
- Keep scripts idempotent when possible.

## Extensive Guidance Appendix
The following numbered items provide detailed, granular guidance for Codex-style agents. These are intentionally verbose to aid retrieval and reinforce best practices.

0001. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0002. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0003. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0004. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0005. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0006. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0007. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0008. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0009. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0010. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0011. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0012. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0013. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0014. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0015. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0016. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0017. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0018. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0019. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0020. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0021. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0022. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0023. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0024. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0025. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0026. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0027. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0028. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0029. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0030. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0031. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0032. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0033. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0034. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0035. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0036. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0037. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0038. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0039. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0040. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0041. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0042. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0043. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0044. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0045. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0046. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0047. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0048. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0049. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0050. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0051. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0052. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0053. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0054. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0055. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0056. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0057. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0058. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0059. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0060. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0061. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0062. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0063. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0064. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0065. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0066. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0067. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0068. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0069. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0070. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0071. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0072. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0073. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0074. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0075. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0076. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0077. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0078. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0079. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0080. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0081. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0082. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0083. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0084. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0085. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0086. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0087. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0088. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0089. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0090. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0091. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0092. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0093. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0094. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0095. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0096. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0097. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0098. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0099. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0100. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0101. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0102. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0103. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0104. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0105. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0106. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0107. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0108. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0109. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0110. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0111. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0112. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0113. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0114. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0115. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0116. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0117. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0118. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0119. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0120. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0121. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0122. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0123. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0124. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0125. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0126. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0127. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0128. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0129. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0130. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0131. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0132. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0133. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0134. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0135. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0136. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0137. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0138. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0139. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0140. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0141. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0142. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0143. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0144. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0145. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0146. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0147. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0148. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0149. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0150. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0151. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0152. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0153. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0154. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0155. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0156. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0157. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0158. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0159. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0160. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0161. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0162. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0163. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0164. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0165. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0166. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0167. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0168. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0169. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0170. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0171. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0172. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0173. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0174. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0175. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0176. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0177. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0178. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0179. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0180. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0181. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0182. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0183. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0184. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0185. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0186. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0187. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0188. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0189. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0190. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0191. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0192. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0193. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0194. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0195. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0196. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0197. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0198. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0199. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0200. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0201. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0202. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0203. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0204. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0205. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0206. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0207. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0208. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0209. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0210. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0211. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0212. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0213. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0214. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0215. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0216. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0217. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0218. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0219. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0220. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0221. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0222. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0223. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0224. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0225. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0226. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0227. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0228. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0229. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0230. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0231. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0232. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0233. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0234. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0235. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0236. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0237. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0238. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0239. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0240. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0241. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0242. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0243. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0244. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0245. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0246. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0247. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0248. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0249. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0250. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0251. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0252. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0253. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0254. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0255. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0256. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0257. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0258. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0259. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0260. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0261. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0262. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0263. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0264. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0265. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0266. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0267. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0268. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0269. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0270. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0271. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0272. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0273. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0274. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0275. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0276. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0277. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0278. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0279. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0280. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0281. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0282. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0283. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0284. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0285. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0286. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0287. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0288. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0289. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0290. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0291. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0292. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0293. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0294. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0295. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0296. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0297. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0298. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0299. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0300. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0301. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0302. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0303. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0304. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0305. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0306. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0307. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0308. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0309. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0310. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0311. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0312. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0313. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0314. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0315. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0316. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0317. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0318. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0319. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0320. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0321. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0322. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0323. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0324. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0325. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0326. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0327. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0328. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0329. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0330. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0331. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0332. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0333. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0334. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0335. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0336. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0337. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0338. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0339. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0340. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0341. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0342. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0343. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0344. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0345. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0346. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0347. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0348. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0349. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0350. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0351. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0352. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0353. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0354. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0355. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0356. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0357. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0358. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0359. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0360. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0361. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0362. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0363. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0364. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0365. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0366. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0367. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0368. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0369. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0370. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0371. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0372. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0373. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0374. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0375. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0376. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0377. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0378. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0379. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0380. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0381. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0382. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0383. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0384. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0385. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0386. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0387. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0388. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0389. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0390. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0391. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0392. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0393. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0394. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0395. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0396. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0397. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0398. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0399. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0400. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0401. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0402. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0403. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0404. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0405. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0406. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0407. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0408. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0409. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0410. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0411. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0412. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0413. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0414. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0415. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0416. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0417. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0418. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0419. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0420. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0421. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0422. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0423. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0424. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0425. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0426. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0427. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0428. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0429. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0430. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0431. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0432. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0433. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0434. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0435. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0436. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0437. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0438. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0439. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0440. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0441. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0442. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0443. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0444. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0445. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0446. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0447. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0448. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0449. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0450. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0451. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0452. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0453. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0454. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0455. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0456. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0457. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0458. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0459. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0460. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0461. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0462. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0463. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0464. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0465. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0466. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0467. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0468. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0469. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0470. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0471. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0472. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0473. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0474. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0475. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0476. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0477. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0478. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0479. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0480. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0481. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0482. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0483. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0484. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0485. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0486. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0487. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0488. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0489. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0490. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0491. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0492. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0493. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0494. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0495. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0496. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0497. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0498. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0499. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0500. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0501. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0502. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0503. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0504. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0505. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0506. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0507. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0508. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0509. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0510. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0511. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0512. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0513. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0514. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0515. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0516. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0517. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0518. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0519. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0520. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0521. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0522. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0523. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0524. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0525. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0526. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0527. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0528. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0529. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0530. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0531. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0532. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0533. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0534. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0535. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0536. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0537. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0538. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0539. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0540. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0541. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0542. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0543. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0544. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0545. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0546. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0547. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0548. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0549. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0550. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0551. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0552. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0553. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0554. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0555. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0556. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0557. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0558. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0559. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0560. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0561. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0562. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0563. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0564. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0565. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0566. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0567. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0568. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0569. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0570. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0571. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0572. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0573. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0574. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0575. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0576. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0577. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0578. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0579. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0580. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0581. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0582. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0583. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0584. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0585. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0586. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0587. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0588. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0589. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0590. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0591. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0592. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0593. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0594. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0595. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0596. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0597. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0598. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0599. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0600. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0601. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0602. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0603. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0604. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0605. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0606. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0607. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0608. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0609. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0610. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0611. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0612. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0613. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0614. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0615. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0616. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0617. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0618. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0619. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0620. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0621. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0622. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0623. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0624. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0625. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0626. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0627. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0628. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0629. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0630. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0631. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0632. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0633. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0634. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0635. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0636. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0637. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0638. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0639. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0640. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0641. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0642. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0643. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0644. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0645. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0646. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0647. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0648. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0649. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0650. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0651. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0652. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0653. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0654. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0655. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0656. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0657. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0658. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0659. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0660. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0661. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0662. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0663. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0664. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0665. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0666. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0667. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0668. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0669. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0670. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0671. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0672. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0673. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0674. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0675. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0676. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0677. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0678. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0679. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0680. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0681. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0682. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0683. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0684. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0685. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0686. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0687. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0688. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0689. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0690. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0691. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0692. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0693. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0694. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0695. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0696. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0697. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0698. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0699. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0700. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
0701. Prefer clarity over cleverness; document non-obvious decisions and cite evidence when possible.
