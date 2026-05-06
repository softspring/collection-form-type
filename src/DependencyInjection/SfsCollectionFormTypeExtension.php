<?php

declare(strict_types=1);

namespace Softspring\Component\CollectionFormType\DependencyInjection;

use Symfony\Component\AssetMapper\AssetMapperInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;

final class SfsCollectionFormTypeExtension extends Extension implements PrependExtensionInterface
{
    public function prepend(ContainerBuilder $container): void
    {
        if (interface_exists(AssetMapperInterface::class)) {
            $container->prependExtensionConfig('framework', [
                'asset_mapper' => [
                    'paths' => [
                        \dirname(__DIR__, 2).'/assets/dist' => '@softspring/collection-form-type',
                    ],
                ],
            ]);
        }
    }

    public function load(array $configs, ContainerBuilder $container): void
    {
    }
}
