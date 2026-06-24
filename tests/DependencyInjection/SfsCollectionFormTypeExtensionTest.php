<?php

namespace Softspring\Component\CollectionFormType\Tests\DependencyInjection;

use PHPUnit\Framework\TestCase;
use Softspring\Component\CollectionFormType\DependencyInjection\SfsCollectionFormTypeExtension;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class SfsCollectionFormTypeExtensionTest extends TestCase
{
    public function testPrependRegistersAssetMapperPath(): void
    {
        $container = new ContainerBuilder();

        (new SfsCollectionFormTypeExtension())->prepend($container);

        self::assertSame([
            [
                'asset_mapper' => [
                    'paths' => [
                        \dirname(__DIR__, 2).'/assets/dist' => '@softspring/collection-form-type',
                    ],
                ],
            ],
        ], $container->getExtensionConfig('framework'));
    }

    public function testLoadDoesNotRequireConfiguration(): void
    {
        $container = new ContainerBuilder();

        (new SfsCollectionFormTypeExtension())->load([], $container);

        self::assertSame(['service_container'], array_keys($container->getDefinitions()));
    }
}
