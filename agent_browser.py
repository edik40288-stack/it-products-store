import asyncio
from playwright.async_api import async_playwright
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

async def main():
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://remoteok.com/remote-prompt-engineer-jobs'
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print(f"Navigating to {url}...")
        await page.goto(url)
        await page.wait_for_timeout(2000)
        
        # Get all job links
        jobs = await page.query_selector_all('tr.job')
        links = []
        for job in jobs[:3]: # Take top 3 to keep output manageable
            title_elem = await job.query_selector('h2[itemprop="title"]')
            link_elem = await job.query_selector('a[itemprop="url"]')
            if link_elem and title_elem:
                title = await title_elem.inner_text()
                href = await link_elem.get_attribute('href')
                links.append({"title": title.strip(), "url": "https://remoteok.com" + href})
                
        print(f"Found {len(links)} jobs to investigate.")
        
        for item in links:
            print(f"\n=====================================")
            print(f"JOB TITLE: {item['title']}")
            print(f"URL: {item['url']}")
            print(f"=====================================")
            
            await page.goto(item['url'])
            await page.wait_for_timeout(1500)
            
            # Extract full description
            desc_elem = await page.query_selector('.description')
            if desc_elem:
                text = await desc_elem.inner_text()
                print(text) 
            else:
                body = await page.query_selector('body')
                text = await body.inner_text()
                print(text[:1500] + "\n... [TRUNCATED]")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
