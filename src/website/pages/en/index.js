/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = "" } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div
        className="homeContainer"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundImage: `url(${baseUrl}img/bg1.jpg)`
        }}
      >
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo" style={{ zIndex: -1 }}>
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle" style={{ color: "#fff" }}>
        <a
          href="https://github.com/concentjs/concent"
          style={{ fontSize: 80, color: "#fff" }}
          target="blink"
        >
          {siteConfig.title}
        </a>
        <small style={{ opacity: 0.8 }}>{siteConfig.tagline1}</small>
        <small style={{ opacity: 0.8 }}>{siteConfig.tagline2}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/undraw_monitor.svg`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />

          <PromoSection>
            <Button
              target="blink"
              href="docs/doc-intro-what-is-concent"
            >
              concent是什么
            </Button>
            <Button
              target="blink"
              href="docs/api-top-run"
            >
              api文档
            </Button>

            <Button
              target="blink"
              href="https://stackblitz.com/edit/cc-simple-counter"
            >
              试一试counter
            </Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = "" } = this.props;
    const { baseUrl } = siteConfig;

    const Block = props => (
      <Container
        padding={["bottom", "top"]}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align="left"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{ textAlign: "center" }}
      >
        <h2>生态与周边</h2>
        <a href="https://github.com/concentjs/react-router-concent" target="blank">
          react-router-concent
        </a>
        <MarkdownBlock>
          {`
            让你的concent应用与react-router在一起工作，上手简单，理解容易
            `}
        </MarkdownBlock>
        <a href="https://github.com/concentjs/concent-plugin-loading" target="blank">
          concent-plugin-loading
        </a>
        <MarkdownBlock>
          {`
            一个让你能够轻松的集中管理各个模块loading状态的插件
            `}
        </MarkdownBlock>
      </div>
    );

    const TryOut = () => (
      <Block id="try">
        {[
          {
            content:
              "To make your landing page more attractive, use illustrations! Check out " +
              "[**unDraw**](https://undraw.co/) which provides you with customizable illustrations which are free to use. " +
              "The illustrations you see on this page are from unDraw.",
            image: `${baseUrl}img/undraw_code_review.svg`,
            imageAlign: "left",
            title: "Wonderful SVG Illustrations"
          }
        ]}
      </Block>
    );

    const Description = () => (
      <Block background="dark">
        {[
          {
            content:
              "This is another description of how this project is useful",
            image: `${baseUrl}img/undraw_note_list.svg`,
            imageAlign: "right",
            title: "Description"
          }
        ]}
      </Block>
    );

    const LearnHow = () => (
      <Block background="light">
        {[
          {
            content: `<a href="https://github.com/fantasticsoul/rcc-antd-pro">and-design-pro-powered-by-concent</a>`,
            image: `${baseUrl}img/undraw_youtube_tutorial.svg`,
            imageAlign: "right",
            title: "精彩工程实例"
          }
        ]}
      </Block>
    );

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content:
              "concent不需要在app顶层包裹类似Provider的组件来向整个app注入store，你只需要将你的react类注册成到concent里，就接入了状态管理，" +
              "setState会将状态写入到store",
            image: `${baseUrl}img/icon/00.png`,
            imageAlign: "top",
            title: "0入侵成本接入"
          },
          {
            content:
              "顶层的核心api只有2个：run、register，run用于载入你的store定义，register负责将你的react组件注册为cc组件",
            image: `${baseUrl}img/icon/01.png`,
            imageAlign: "top",
            title: "核心api少且简单，功能强大"
          },
          {
            content:
              "事实上concent的store更加智能与实用，允许用户按需定义state、reducer、watch、computed、init。" +
              "让你的ui视图与业务逻辑彻底解耦，代码组织结构同时兼顾了优雅与简单",
            image: `${baseUrl}img/icon/02.png`,
            imageAlign: "top",
            title: "提供全局模块化的单一数据源"
          },
          {
            content:
              "每一个cc类可以观察自己所属模块的指定key的状态变化，所有的cc类都可以观察全局状态的指定key变化，" +
              "不仅如此，用户还可以通过定义connect观察其他任意模块的任意key的状态变化",
            image: `${baseUrl}img/icon/03.png`,
            imageAlign: "top",
            title: "状态的连接方式多样，消费粒度灵活"
          },
          {
            content:
              "除了最传统的setState，concent还允许用户调用dispatch(type:string, payload:object)以及invoke(fn:function, ...args:any[])去修改状态",
            image: `${baseUrl}img/icon/04.png`,
            imageAlign: "top",
            title: "支持多种方式提交变更状态"
          },
          {
            content:
              "模块里定义的computed和watch属于模块级别的定义，concent还允许用户在类里定义类级别的$$watch、$$computed，" +
              "以满足不同场景的个性化需求，同时所有cc实例都拥有$$emit&$$on能力。",
            image: `${baseUrl}img/icon/05.png`,
            imageAlign: "top",
            title: "对组件扩展了很多强大的特性"
          },
          {
            content:
              "CcFragment拥有与cc类同样的能力，允许你快速连接多个模块的状态，满足你写function组件的需求，同时CcFragment内置了与react保持100%一致用法的hook," +
              "用于管理组件局部状态",
            image: `${baseUrl}img/icon/06.png`,
            imageAlign: "top",
            title: "hook&&CcFragment"
          },
          {
            content:
              "concent基于引用定位和状态广播，支持任意粒度的状态订阅，渲染效率出众",
            image: `${baseUrl}img/icon/07.png`,
            imageAlign: "top",
            title: "渲染性能出众"
          },
          {
            content:
              "默认采用反向继承包裹你的组件，让你的react dom树的层级结构更少更干净",
            image: `${baseUrl}img/icon/08.png`,
            imageAlign: "top",
            title: "dom层级更少"
          },
          {
            content:
              "concent允许用户定义中间件拦截所有的数据变更提交记录，做额外的特殊需求处理，如时间旅行和状态回溯...",
            image: `${baseUrl}img/icon/09.png`,
            imageAlign: "top",
            title: "支持中间件机制"
          },
          {
            content:
              "除了在启动的时候载入用户规划好的各个模块组装好的store，concent还允许你在启动后动态配置模块，" +
              "这样方便用户将组件和其模块定义放置在同一个文件夹，打包后发布到concent组件市场，方便别人直接引入你的concent组件",
            image: `${baseUrl}img/icon/10.png`,
            imageAlign: "top",
            title: "动态配置模块"
          },
          {
            content:
              "concent支持对已定义模块进行克隆与复制，复制内容包括其state、computed、watch、reducer和init，" +
              "这些克隆出的模块在运行时是各自完全独立的，以满足用户抽象工厂函数动态创建属于不同模块的cc类",
            image: `${baseUrl}img/icon/11.png`,
            imageAlign: "top",
            title: "模块克隆"
          }
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : "") + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>谁在使用?</h2>
          <p>concent已服务于它们</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl("users.html")}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <LearnHow />
          <TryOut />
          <Description />
          <Showcase />
        </div>
      </div>
    );
  }
}

module.exports = Index;
